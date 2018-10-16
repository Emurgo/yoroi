// @flow

import moment from 'moment'
import _ from 'lodash'

import * as util from './util'
import api from '../api'
import {CONFIG} from '../config'

import type {Moment} from 'moment'
import type {RawTransaction} from '../types/HistoryTransaction'

const getLastTimestamp = (history: Array<RawTransaction>): ?Moment => {
  // Note(ppershing): ISO8601 dates can be sorted as strings
  // and the result is expected
  const max = _.max(history.map((tx) => tx.last_update))
  return moment(max)
}

class WalletManager {
  masterKey: any
  internalAddresses: Array<string>
  externalAddresses: Array<string>
  // Note(ppershing): we might want to store these
  // in a set in future
  internalUsed: Array<string>
  externalUsed: Array<string>

  transactions: any
  lastSyncTimePerBatch: Array<Moment>

  constructor() {
    this.clearAllData()
  }

  clearAllData() {
    this.masterKey = null
    this.internalAddresses = []
    this.externalAddresses = []
    this.internalUsed = []
    this.externalUsed = []
    this.transactions = {}
    this.lastSyncTimePerBatch = []
  }

  getAccount() {
    return util.getAccountFromMasterKey(
      this.masterKey,
      CONFIG.CARDANO.PROTOCOL_MAGIC
    )
  }

  async restoreWallet(mnemonic: string, newPassword: string) {
    this.masterKey = util.getMasterKeyFromMnemonic(mnemonic)
    const account = this.getAccount()
    this.masterKey = util.encryptMasterKey(newPassword, this.masterKey)

    const internal = await util.discoverAddresses({
      account,
      type: 'Internal',
      highestUsedIndex: -1,
      startIndex: 0,
      filterUsedAddressesFn: api.filterUsedAddresses,
      gapLimit: CONFIG.WALLET.DISCOVERY_GAP_SIZE,
      batchSize: CONFIG.WALLET.DISCOVERY_BLOCK_SIZE,
    })
    this.internalAddresses = internal.addresses
    this.internalUsed = internal.used

    const external = await util.discoverAddresses({
      account,
      type: 'External',
      highestUsedIndex: -1,
      startIndex: 0,
      filterUsedAddressesFn: api.filterUsedAddresses,
      gapLimit: CONFIG.WALLET.DISCOVERY_GAP_SIZE,
      batchSize: CONFIG.WALLET.DISCOVERY_BLOCK_SIZE,
    })
    this.externalAddresses = external.addresses
    this.externalUsed = external.used
  }

  async updateTxHistory() {
    const allAddresses = [...this.internalAddresses, ...this.externalAddresses]

    const MAX_ADDRESSES_PER_REQUEST = CONFIG.WALLET.DISCOVERY_BLOCK_SIZE
    const chunks = _.zip(
      this.lastSyncTimePerBatch,
      _.chunk(allAddresses, MAX_ADDRESSES_PER_REQUEST)
    )

    const responses = await Promise.all(
      chunks.map(([ts, addrs]) => api.fetchNewTxHistory(ts || moment(0), addrs))
    )

    this.lastSyncTimePerBatch = responses.map(getLastTimestamp)

    const response = _.flatten(responses)

    const keyed = _.keyBy(response, (tx) => tx.hash)

    // TODO(ppershing): watch for changes in existing transactions
    this.transactions = {
      ...this.transactions,
      ...keyed,
    }
    return this.transactions
  }
}

export default new WalletManager()
