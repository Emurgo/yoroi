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
  addresses: Array<string>
  used: Array<string>
  addressGenerator: (Array<number>) => Array<string>
  lastSyncTimePerBatch: Array<Moment>

  constructor(addressGenerator: any) {
    this.addressGenerator = addressGenerator
    this.addresses = []
    this.used = []
    this.lastSyncTimePerBatch = []

    this.ensureEnoughGeneratedAddresses()
  }

  selfCheck() {
    assertTrue(this.addresses.length % CONFIG.WALLET.DISCOVERY_BLOCK_SIZE === 0)
  }

  getHighestUsedIndex() {
    return _.findLastIndex(
      this.addresses, (addr) => this.used.includes(addr)
    )
  }

  ensureEnoughGeneratedAddresses() {
    while (this.getHighestUsedIndex() + CONFIG.WALLET.DISCOVERY_GAP_SIZE >= this.addresses.length) {
      const start = this.addresses.length
      const newAddresses = this.addressGenerator(
        _.range(start, start + CONFIG.WALLET.DISCOVERY_BLOCK_SIZE)
      )
      Logger.debug('discover', newAddresses)
      this.addresses.push(...newAddresses)
      this.lastSyncTimePerBatch.push(moment(VERY_OLD_TIME))
    }
    this.selfCheck()
  }

  isMyAddress(address: string) {
    return this.addresses.includes(address)
  }

  markAddressAsUsed(address: string) {
    assertTrue(this.isMyAddress(address))
    if (this.used.includes(address)) return // we already know
    Logger.debug('marking address as used', address)
    this.used.push(address)
    this.ensureEnoughGeneratedAddresses()
    this.selfCheck()
  }

  getAddressBlocksWithLastSyncTime() {
    return _.zip(
      this.lastSyncTimePerBatch,
      _.chunk(this.addresses, CONFIG.WALLET.DISCOVERY_BLOCK_SIZE)
    )
  }

  updateBlockTime(idx: number, time: Moment) {
    assertTrue(idx >= 0)
    assertTrue(idx < this.lastSyncTimePerBatch.length)
    assertFalse(time.isBefore(this.lastSyncTimePerBatch[idx]))
    this.lastSyncTimePerBatch[idx] = time
  }
}

export class WalletManager {
  masterKey: any
  internalChain: AddressChainManager
  externalChain: AddressChainManager

  transactions: any
  isInitialized: boolean

  constructor() {
    this.clearAllData()
  }

  clearAllData() {
    this.masterKey = null
    // $FlowFixMe
    this.internalChain = null
    // $FlowFixMe
    this.externalChain = null

    this.transactions = {}
    this.isInitialized = false
  }

  getAccount() {
    return util.getAccountFromMasterKey(
      this.masterKey,
      CONFIG.CARDANO.PROTOCOL_MAGIC
    )
  }

  async restoreWallet(mnemonic: string, newPassword: string) {
    Logger.info('restore wallet')
    assertFalse(this.isInitialized)
    this.masterKey = util.getMasterKeyFromMnemonic(mnemonic)
    const account = this.getAccount()
    this.masterKey = util.encryptMasterKey(newPassword, this.masterKey)
    this.internalChain = new AddressChainManager(
      (ids) => util.getInternalAddresses(account, ids)
    )
    this.externalChain = new AddressChainManager(
      (ids) => util.getExternalAddresses(account, ids)
    )

    this.isInitialized = true
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
  }


  markAddressAsUsed(address: string) {
    this.internalChain.isMyAddress(address) && this.internalChain.markAddressAsUsed(address)
    this.externalChain.isMyAddress(address) && this.externalChain.markAddressAsUsed(address)
  }

  didProcessTransaction(tx: RawTransaction): boolean {
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
    tx.inputs_address.forEach((a) => this.markAddressAsUsed(a))
    tx.outputs_address.forEach((a) => this.markAddressAsUsed(a))

    // TODO(ppershing): make sure everyting above this line is ok with old
    // content of this.transactions[id] !
    this.transactions[id] = tx
    return true
  }

  // Returns number of updated transactions
  updateTransactions(transactions: Array<RawTransaction>): number {
    const updated = transactions.map((t) => this.didProcessTransaction(t))
    return _.sum(updated, (x) => x ? 1 : 0)
  }

  async doSyncStep(chain: AddressChainManager): Promise<number> {
    const blocks = chain.getAddressBlocksWithLastSyncTime()

    const responses = await Promise.all(
      blocks.map(([ts, addrs]) => api.fetchNewTxHistory(ts, addrs)),
    )

    let count = 0

    responses.forEach((response, idx) => {
      count += this.updateTransactions(response)
      // Note: this needs to happen *after* updating transactions in case the former fails!
      chain.updateBlockTime(idx, getLastTimestamp(response))
    })

    return count
  }
}

export default new WalletManager()
