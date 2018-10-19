// @flow

import moment from 'moment'
import _ from 'lodash'

import * as util from './util'
import api from '../api'
import {CONFIG} from '../config'
import {assertTrue, assertFalse} from '../utils/assert'
import {Logger} from '../utils/logging'

import type {Moment} from 'moment'
import type {RawTransaction} from '../types/HistoryTransaction'


const VERY_OLD_TIME = '2000-01-01T00:00:00.000Z'

const getLastTimestamp = (history: Array<RawTransaction>): ?Moment => {
  // Note(ppershing): ISO8601 dates can be sorted as strings
  // and the result is expected
  const max = _.max(history.map((tx) => tx.last_update))
  return moment(max || VERY_OLD_TIME)
}

class AddressChainManager {
  _addresses: Array<string>
  _used: Set<string>
  _addressGenerator: (Array<number>) => Array<string>
  _lastSyncTimePerBatch: Array<Moment>
  _blockSize: number
  _gapSize: number

  constructor(addressGenerator: any) {
    this._addressGenerator = addressGenerator
    this._addresses = []
    this._used = new Set()
    this._lastSyncTimePerBatch = []
    this._blockSize = CONFIG.WALLET.DISCOVERY_BLOCK_SIZE
    this._gapSize = CONFIG.WALLET.DISCOVERY_GAP_SIZE
    this._ensureEnoughGeneratedAddresses()
  }

  _selfCheck() {
    assertTrue(this._addresses.length % this._blockSize === 0)
    assertTrue(this._lastSyncTimePerBatch.length * this._blockSize === this._addresses.length)
  }

  getHighestUsedIndex() {
    return _.findLastIndex(
      this._addresses, (addr) => this._used.has(addr)
    )
  }

  _ensureEnoughGeneratedAddresses() {
    while (this.getHighestUsedIndex() + this._gapSize >= this._addresses.length) {
      const start = this._addresses.length
      const newAddresses = this._addressGenerator(
        _.range(start, start + this._blockSize)
      )
      Logger.debug('discover', newAddresses)
      this._addresses.push(...newAddresses)
      this._lastSyncTimePerBatch.push(moment(VERY_OLD_TIME))
    }
    this._selfCheck()
  }

  isMyAddress(address: string) {
    return this._addresses.includes(address)
  }

  markAddressAsUsed(address: string) {
    assertTrue(this.isMyAddress(address))
    if (this._used.has(address)) return // we already know
    Logger.debug('marking address as used', address)
    this._used.add(address)
    this._ensureEnoughGeneratedAddresses()
    this._selfCheck()
  }

  getAddressBlocksWithLastSyncTime() {
    return _.zip(
      this._lastSyncTimePerBatch,
      _.chunk(this._addresses, CONFIG.WALLET.DISCOVERY_BLOCK_SIZE)
    )
  }

  updateBlockTime(idx: number, time: Moment) {
    assertTrue(idx >= 0)
    assertTrue(idx < this._lastSyncTimePerBatch.length)
    assertFalse(time.isBefore(this._lastSyncTimePerBatch[idx]))
    this._lastSyncTimePerBatch[idx] = time
    this._selfCheck()
  }
}

export class WalletManager {
  masterKey: any
  internalChain: AddressChainManager
  externalChain: AddressChainManager

  transactions: any
  isInitialized: boolean

  constructor() {
    this._clearAllData()
  }

  _clearAllData() {
    this.masterKey = null
    // $FlowFixMe
    this.internalChain = null
    // $FlowFixMe
    this.externalChain = null
    this.transactions = {}
    this.isInitialized = false
  }

  _getAccount() {
    return util.getAccountFromMasterKey(
      this.masterKey,
      CONFIG.CARDANO.PROTOCOL_MAGIC
    )
  }

  restoreWallet(mnemonic: string, newPassword: string) {
    Logger.info('restore wallet')
    assertFalse(this.isInitialized)
    this.masterKey = util.getMasterKeyFromMnemonic(mnemonic)
    const account = this._getAccount()
    this.masterKey = util.encryptMasterKey(newPassword, this.masterKey)
    this.internalChain = new AddressChainManager(
      (ids) => util.getInternalAddresses(account, ids)
    )
    this.externalChain = new AddressChainManager(
      (ids) => util.getExternalAddresses(account, ids)
    )

    this.isInitialized = true
  }

  // TODO(ppershing): remove this once we can "open" saved wallet from device store
  __initTestWalletIfNeeded() {
    if (this.isInitialized) return
    const mnemonic = [
      'dry balcony arctic what garbage sort',
      'cart shine egg lamp manual bottom',
      'slide assault bus',
    ].join(' ')
    this.restoreWallet(mnemonic, '')
  }

  async doFullSync() {
    Logger.info('Do full sync')
    assertTrue(this.isInitialized)
    let keepGoing = true
    while (keepGoing) {
      const changedInternal = await this.doSyncStep(this.internalChain)
      const changedExternal = await this.doSyncStep(this.externalChain)
      keepGoing = changedInternal || changedExternal
    }

    return {...this.transactions}
  }


  _markAddressAsUsed(address: string) {
    this.internalChain.isMyAddress(address) && this.internalChain.markAddressAsUsed(address)
    this.externalChain.isMyAddress(address) && this.externalChain.markAddressAsUsed(address)
  }

  _didProcessTransaction(tx: RawTransaction): boolean {
    const id = tx.hash
    // We have this transaction and it did not change
    if (this.transactions[id] && this.transactions[id].time === tx.time) {
      return false
    }
    if (this.transactions[id]) {
      // Do things that matter if the transaction changed!
      Logger.info('Tx changed', tx)
    }

    // Do all things that needs to be done on transaction
    tx.inputs_address.forEach((a) => this._markAddressAsUsed(a))
    tx.outputs_address.forEach((a) => this._markAddressAsUsed(a))

    // TODO(ppershing): make sure everyting above this line is ok with old
    // content of this.transactions[id] !
    this.transactions[id] = tx
    return true
  }

  // Returns number of updated transactions
  _updateTransactions(transactions: Array<RawTransaction>): number {
    const updated = transactions.map((t) => this._didProcessTransaction(t))
    return _.sum(updated, (x) => x ? 1 : 0)
  }

  async doSyncStep(chain: AddressChainManager): Promise<number> {
    const blocks = chain.getAddressBlocksWithLastSyncTime()

    const responses = await Promise.all(
      blocks.map(([ts, addrs]) => api.fetchNewTxHistory(ts, addrs)),
    )

    let count = 0

    responses.forEach((response, idx) => {
      count += this._updateTransactions(response)
      // Note: this needs to happen *after* updating transactions in case the former fails!
      chain.updateBlockTime(idx, getLastTimestamp(response))
    })

    return count
  }
}

export default new WalletManager()
