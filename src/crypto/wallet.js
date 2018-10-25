// @flow

import moment from 'moment'
import _ from 'lodash'
import pLimit from 'p-limit'

import {AddressChainManager} from './chain'
import * as util from './util'
import api from '../api'
import {CONFIG} from '../config'
import {assertTrue, assertFalse} from '../utils/assert'
import {Logger} from '../utils/logging'

import type {Moment} from 'moment'
import type {
  RawTransaction,
  RawUtxo,
  TransactionInput,
  PreparedTransactionData,
} from '../types/HistoryTransaction'

const getLastTimestamp = (history: Array<RawTransaction>): ?Moment => {
  // Note(ppershing): ISO8601 dates can be sorted as strings
  // and the result is expected
  const max = _.max(history.map((tx) => tx.last_update))
  return moment(max || 0)

}

export class WalletManager {
  encryptedMasterKey: any
  internalChain: AddressChainManager
  externalChain: AddressChainManager
  transactions: any
  isInitialized: boolean

  constructor() {
    this._clearAllData()
  }

  _clearAllData() {
    this.encryptedMasterKey = null
    // $FlowFixMe
    this.internalChain = null
    // $FlowFixMe
    this.externalChain = null
    this.transactions = {}
    this.isInitialized = false
  }

  _getAccount(masterKey) {
    return util.getAccountFromMasterKey(masterKey)
  }

  restoreWallet(mnemonic: string, newPassword: string) {
    Logger.info('restore wallet')
    assertFalse(this.isInitialized)
    const masterKey = util.getMasterKeyFromMnemonic(mnemonic)
    const account = this._getAccount(masterKey)
    this.encryptedMasterKey = util.encryptMasterKey(newPassword, masterKey)
    this.internalChain = new AddressChainManager((ids) =>
      util.getInternalAddresses(account, ids),
    )
    this.externalChain = new AddressChainManager((ids) =>
      util.getExternalAddresses(account, ids),
    )

    this.isInitialized = true
  }

  // TODO(ppershing): remove this once we can "open"
  // saved wallet from device store
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

  getOwnAddresses() {
    if (this.isInitialized) {
      return [
        ...this.internalChain._addresses,
        ...this.externalChain._addresses,
      ]
    }

    return []
  }

  _markAddressAsUsed(address: string) {
    this.internalChain.isMyAddress(address) &&
      this.internalChain.markAddressAsUsed(address)
    this.externalChain.isMyAddress(address) &&
      this.externalChain.markAddressAsUsed(address)
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
    return _.sum(updated, (x) => (x ? 1 : 0))
  }

  async doSyncStep(chain: AddressChainManager): Promise<number> {
    let count = 0
    const errors = []

    const limit = pLimit(CONFIG.MAX_CONCURRENT_REQUESTS)

    const tasks = chain
      .getBlocks()
      .map(([idx, ts, addrs]) =>
        limit(() =>
          api.fetchNewTxHistory(ts, addrs).then((response) => [idx, response]),
        ),
      )

    // Note(ppershing): This serializes the respons order
    // but still allows for concurrent requests
    for (const promise of tasks) {
      try {
        const [idx, response] = await promise
        count += this._updateTransactions(response)
        // Note: this needs to happen *after* updating
        // transactions in case the former fails!
        chain.updateBlockTime(idx, getLastTimestamp(response))
      } catch (e) {
        errors.push(e)
      }
    }

    if (errors.length) throw errors
    return count
  }

  transformUtxoToInput(utxo: RawUtxo): TransactionInput {
    let addressIndex = null
    let addressType = ''

    if (this.internalChain.isMyAddress(utxo.receiver)) {
      addressType = 'Internal'
      addressIndex = this.internalChain.getIndexOfAddress(utxo.receiver)
    } else {
      addressType = 'External'
      addressIndex = this.externalChain.getIndexOfAddress(utxo.receiver)
    }

    assertTrue(
      addressIndex !== -1,
      `Address not found for utxo: ${utxo.receiver}`,
    )

    return {
      ptr: {
        id: utxo.tx_hash,
        index: utxo.tx_index,
      },
      value: {
        address: utxo.receiver,
        value: utxo.amount,
      },
      addressing: {
        account: CONFIG.WALLET.ACCOUNT_INDEX,
        change: util.getAddressTypeIndex(addressType),
        index: addressIndex,
      },
    }
  }

  getChangeAddress() {
    return this.internalChain.getFirstUnused()
  }

  async prepareTransaction(
    receiverAddress: string,
    amount: number,
  ): Promise<PreparedTransactionData> {
    // For now we do not support custom sender so we query all addresses
    const utxos = await api.bulkFetchUTXOsForAddresses(this.getOwnAddresses())
    const inputs = utxos.map((utxo) => this.transformUtxoToInput(utxo))

    // FIXME: use bignumbers here
    const outputs = [{address: receiverAddress, value: `${amount}`}]
    const changeAddress = this.getChangeAddress()
    Logger.info(this.internalChain._addresses)

    const fakeWallet = util.generateFakeWallet()
    const fee = util.signTransaction(fakeWallet, inputs, outputs, changeAddress)
      .fee
    Logger.info(inputs)
    Logger.info(outputs)
    Logger.info(changeAddress)

    return {
      inputs,
      outputs,
      changeAddress,
      fee,
    }
  }

  async submitTransaction(
    transaction: PreparedTransactionData,
    password: string,
  ) {
    const {inputs, outputs, changeAddress, fee} = transaction

    const decryptedMasterKey = util.decryptMasterKey(
      password,
      this.encryptedMasterKey,
    )
    const signedTxData = util.signTransaction(
      util.getWalletFromMasterKey(decryptedMasterKey),
      inputs,
      outputs,
      changeAddress,
    )

    assertTrue(fee === signedTxData.fee, 'Transaction fee does not match')

    const signedTx = Buffer.from(signedTxData.cbor_encoded_tx).toString(
      'base64',
    )
    const response = await api.submitTransaction(signedTx)
    Logger.info(response)
    return response
  }
}

export default new WalletManager()
