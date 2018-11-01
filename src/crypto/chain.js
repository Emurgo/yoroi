// @flow
import _ from 'lodash'
import type {Moment} from 'moment'

import {CONFIG} from '../config'
import {assertTrue, assertFalse} from '../utils/assert'
import {defaultMemoize} from 'reselect'
import {Logger} from '../utils/logging'

import type {Dict} from '../state'

export type AddressBlock = [number, Moment, Array<string>]

type AsyncAddressGenerator = (ids: Array<number>) => Promise<Array<string>>
type AsyncAddressFilter = (addresses: Array<string>) => Promise<Array<string>>

export class AddressChain {
  _addresses: Array<string>
  _getAddresses: AsyncAddressGenerator
  _blockSize: number
  _gapLimit: number
  _isInitialized: boolean
  _subscriptions: Array<(Array<string>) => mixed>
  _addressToIdxSelector: (Array<string>) => Dict<number>

  constructor(
    addressGenerator: AsyncAddressGenerator,
    blockSize: number = CONFIG.WALLET.DISCOVERY_BLOCK_SIZE,
    gapLimit: number = CONFIG.WALLET.DISCOVERY_GAP_SIZE,
  ) {
    assertTrue(blockSize > gapLimit, 'Block size needs to be > gap limit')

    this._getAddresses = addressGenerator
    this._blockSize = blockSize
    this._gapLimit = gapLimit

    this._addresses = []
    this._isInitialized = false
    this._subscriptions = []

    this._addressToIdxSelector = defaultMemoize((addresses: Array<string>) =>
      _.fromPairs(addresses.map((addr, i) => [addr, i])),
    )
  }

  get addresses() {
    return this._addresses
  }

  get addressToIdxMap() {
    return this._addressToIdxSelector(this._addresses)
  }

  addSubscriberToNewAddresses(subscriber: (Array<string>) => mixed) {
    this._subscriptions.push(subscriber)
  }

  async _discoverNewBlock() {
    const _addresses = this._addresses
    const start = this.size()
    const idxs = _.range(start, start + this._blockSize)

    const newAddresses = await this._getAddresses(idxs)

    if (this._addresses !== _addresses) {
      Logger.warn('Concurrent modification to addresses')
    } else {
      this._addresses = [..._addresses, ...newAddresses]
      this._subscriptions.map((sub) => sub(newAddresses))
    }
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
  }

  async sync(filterFn: AsyncAddressFilter) {
    let keepSyncing = true
    while (keepSyncing) {
      keepSyncing = await this._syncStep(filterFn)
    }
  }

  async _syncStep(filterFn: AsyncAddressFilter) {
    this._selfCheck()
    const block = this._getLastBlock()
    const used = await filterFn(block)

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
    return this.addressToIdxMap[address] != null
  }

  getIndexOfAddress(address: string): number {
    assertTrue(this.isMyAddress(address))
    const idx = this.addressToIdxMap[address]
    /* :: if (!idx) throw null */
    return idx
  }

  getBlocks() {
    return _.chunk(this.addresses, this._blockSize)
  }
}
