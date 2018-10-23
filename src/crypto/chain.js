import moment from 'moment'
import _ from 'lodash'

import {CONFIG} from '../config'
import {assertTrue, assertFalse} from '../utils/assert'
import {Logger} from '../utils/logging'

import type {Moment} from 'moment'

export type AddressBlock = [number, Moment, Array<string>]

export class AddressChainManager {
  _addresses: Array<string>
  _addressIndex: Map<string, number>
  _used: Set<string>
  _addressGenerator: (Array<number>) => Array<string>
  _lastSyncTimePerBatch: Array<Moment>
  _blockSize: number
  _gapLimit: number

  constructor(
    addressGenerator: any,
    blockSize: number = CONFIG.WALLET.DISCOVERY_BLOCK_SIZE,
    gapLimit: number = CONFIG.WALLET.DISCOVERY_GAP_SIZE,
  ) {
    this._addressGenerator = addressGenerator
    this._addresses = []
    this._used = new Set()
    this._lastSyncTimePerBatch = []
    this._blockSize = blockSize
    this._gapLimit = gapLimit
    this._addressIndex = new Map()
    this._ensureEnoughGeneratedAddresses()
  }

  _selfCheck() {
    assertTrue(this._addresses.length % this._blockSize === 0)
    assertTrue(
      this._lastSyncTimePerBatch.length * this._blockSize ===
        this._addresses.length,
    )
    assertTrue(this._addresses.length === this._addressIndex.size)
  }

  getHighestUsedIndex() {
    return _.findLastIndex(this._addresses, (addr) => this._used.has(addr))
  }

  _ensureEnoughGeneratedAddresses() {
    while (
      this.getHighestUsedIndex() + this._gapLimit >=
      this._addresses.length
    ) {
      const start = this._addresses.length
      const idxs = _.range(start, start + this._blockSize)
      const newAddresses = this._addressGenerator(idxs)
      Logger.debug('discover', newAddresses)
      this._addresses.push(...newAddresses)
      _.zip(idxs, newAddresses).forEach(([i, addr]) => {
        this._addressIndex.set(addr, i)
      })
      this._lastSyncTimePerBatch.push(moment(0))
    }
    this._selfCheck()
  }

  size() {
    return this._addresses.length
  }

  isMyAddress(address: string) {
    return this._addressIndex.has(address)
  }

  getIndexOfAddress(address: string) {
    assertTrue(this.isMyAddress(address))
    return this._addressIndex.get(address)
  }

  markAddressAsUsed(address: string) {
    assertTrue(this.isMyAddress(address))
    if (this._used.has(address)) return // we already know
    Logger.debug('marking address as used', address)
    this._used.add(address)
    this._ensureEnoughGeneratedAddresses()
    this._selfCheck()
  }

  getBlockCount() {
    return this._lastSyncTimePerBatch.length
  }

  getBlockInfo(idx: number): AddressBlock {
    assertTrue(idx >= 0)
    assertTrue(idx < this.getBlockCount())
    return [
      idx,
      this._lastSyncTimePerBatch[idx],
      this._addresses.slice(idx * this._blockSize, (idx + 1) * this._blockSize),
    ]
  }

  getBlocks(): Array<AddressBlock> {
    return _.range(this.getBlockCount()).map((i) => this.getBlockInfo(i))
  }

  updateBlockTime(idx: number, time: Moment) {
    assertTrue(idx >= 0)
    assertTrue(idx < this.getBlockCount())
    assertFalse(time.isBefore(this._lastSyncTimePerBatch[idx]))
    this._lastSyncTimePerBatch[idx] = time
    this._selfCheck()
  }
}
