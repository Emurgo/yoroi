// @flow
import _ from 'lodash'

import {CONFIG} from '../config'
import {assertTrue, assertFalse} from '../utils/assert'

import type {Moment} from 'moment'

export type AddressBlock = [number, Moment, Array<string>]

type AsyncAddressGenerator = (ids: Array<number>) => Promise<Array<string>>
type AsyncAddressFilter = (addresses: Array<string>) => Promise<Array<string>>

type ChainState = {
  addresses: Array<string>,
  addressIndex: {[string]: number},
}
export class AddressChain {
  _state: ChainState
  _getAddresses: AsyncAddressGenerator
  _filterUsed: AsyncAddressFilter
  _blockSize: number
  _gapLimit: number
  _isInitialized: boolean
  _subscriptions: Array<(Array<string>) => mixed>

  updateState(reducer: (state: ChainState) => ChainState) {
    const state = this._state
    this._state = reducer(state)
    Object.freeze(this._state)
  }

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

    this._state = {
      addresses: [],
      addressIndex: {},
    }
    this._isInitialized = false
    this._subscriptions = []
  }

  addSubscriberToNewAddresses(subscriber: (Array<string>) => mixed) {
    this._subscriptions.push(subscriber)
  }

  async _discoverNewBlock() {
    const start = this.size()
    const idxs = _.range(start, start + this._blockSize)

    const newAddresses = await this._getAddresses(idxs)
    const newIndex = _.fromPairs(_.zip(newAddresses, idxs))

    assertTrue(this.size() === start, 'Concurrent modification')

    this.updateState((state) => ({
      addresses: [...state.addresses, ...newAddresses],
      addressIndex: {...state.addressIndex, ...newIndex},
    }))

    this._subscriptions.map((sub) => sub(newAddresses))
  }

  _getLastBlock() {
    this._selfCheck()
    const block = _.takeRight(this._state.addresses, this._blockSize)
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
    assertTrue(this._state.addresses.length % this._blockSize === 0)
    assertTrue(
      this._state.addresses.length === _.size(this._state.addressIndex),
    )
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
    return this._state.addresses.length
  }

  isMyAddress(address: string) {
    return this._state.addressIndex[address] != null
  }

  getIndexOfAddress(address: string): number {
    assertTrue(this.isMyAddress(address))
    return this._state.addressIndex[address]
  }

  getAddresses() {
    return [...this._state.addresses]
  }

  getBlocks() {
    return _.chunk(this._state.addresses, this._blockSize)
  }
}
