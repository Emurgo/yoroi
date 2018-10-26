// @flow
import _ from 'lodash'

import {CONFIG} from '../config'
import {assertTrue, assertFalse} from '../utils/assert'

import type {Moment} from 'moment'

export type AddressBlock = [number, Moment, Array<string>]

type AsyncAddressGenerator = (ids: Array<number>) => Promise<Array<string>>
type AsyncAddressFilter = (addresses: Array<string>) => Promise<Array<string>>

export class AddressChain {
  _addresses: Array<string>
  _addressIndex: Map<string, number>
  _getAddresses: AsyncAddressGenerator
  _filterUsed: AsyncAddressFilter
  _blockSize: number
  _gapLimit: number
  _isInitialized: boolean
  _subscriptions: Array<(Array<string>) => mixed>

  constructor(
    addressGenerator: AsyncAddressGenerator,
    filterUsed: AsyncAddressFilter,
    blockSize: number = CONFIG.WALLET.DISCOVERY_BLOCK_SIZE,
    gapLimit: number = CONFIG.WALLET.DISCOVERY_GAP_SIZE,
  ) {
    assertTrue(blockSize > gapLimit, 'Block size needs to be > gap limit')

    this._getAddresses = addressGenerator
    this._filterUsed = filterUsed
    this._blockSize = blockSize
    this._gapLimit = gapLimit

    this._addresses = []
    this._addressIndex = new Map()
    this._isInitialized = false
    this._subscriptions = []
  }

  addSubscriberToNewAddresses(subscriber: (Array<string>) => mixed) {
    this._subscriptions.push(subscriber)
  }

  async _discoverNewBlock() {
    const start = this.size()
    const idxs = _.range(start, start + this._blockSize)

    const addresses = await this._getAddresses(idxs)

    assertTrue(this.size() === start, 'Concurrent modification')
    for (const [idx, address] of _.zip(idxs, addresses)) {
      this._addresses.push(address)
      this._addressIndex.set(address, idx)
    }
    this._subscriptions.map((sub) => sub(addresses))
  }

  _getLastBlock() {
    this._selfCheck()
    const block = _.takeRight(this._addresses, this._blockSize)
    assertTrue(block.length === this._blockSize)
    return block
  }

  async initialize() {
    assertFalse(this._isInitialized)
    await this._discoverNewBlock()
    assertFalse(this._isInitialized, 'Concurrent modification')
    this._isInitialized = true
  }

  _selfCheck() {
    assertTrue(this._isInitialized)
    assertTrue(this._addresses.length % this._blockSize === 0)
    assertTrue(this._addresses.length === this._addressIndex.size)
  }

  async sync() {
    let keepSyncing = true
    while (keepSyncing) {
      keepSyncing = await this._syncStep()
    }
  }

  async _syncStep() {
    this._selfCheck()
    const block = this._getLastBlock()
    const used = await this._filterUsed(block)

    // Index relative to the start of the block
    // It is okay to "overshoot" with -1 here
    const lastUsedIdx = used.length > 0 ? block.indexOf(_.last(used)) : -1

    const needsNewBlock = lastUsedIdx + this._gapLimit >= this._blockSize

    if (needsNewBlock) {
      await this._discoverNewBlock()
      return true
    } else {
      return false
    }
  }

  size() {
    return this._addresses.length
  }

  isMyAddress(address: string) {
    return this._addressIndex.has(address)
  }

  getIndexOfAddress(address: string): number {
    assertTrue(this.isMyAddress(address))
    return ((this._addressIndex.get(address): any): number)
  }

  getAddresses() {
    return [...this._addresses]
  }

  getBlocks() {
    return _.chunk(this._addresses, this._blockSize)
  }
}
