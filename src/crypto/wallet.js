// @flow

import moment from 'moment'
import _ from 'lodash'
import {BigNumber} from 'bignumber.js'

import {AddressChain} from './chain'
import * as util from './util'
import api from '../api'
import {CONFIG} from '../config'
import assert from '../utils/assert'
import {Logger} from '../utils/logging'
import {
  synchronize,
  nonblockingSynchronize,
  IsLockedError,
  limitConcurrency,
} from '../utils/promise'

import type {Moment} from 'moment'
import type {
  RawTransaction,
  RawUtxo,
  TransactionInput,
  PreparedTransactionData,
} from '../types/HistoryTransaction'
import type {Mutex} from '../utils/promise'

const getLastTimestamp = (history: Array<RawTransaction>): ?Moment => {
  // Note(ppershing): ISO8601 dates can be sorted as strings
  // and the result is expected
  const max = _.max(history.map((tx) => tx.last_update))
  return moment(max || 0)
}
type SyncMetadata = {
  lastUpdated: Moment,
  bestBlockNum: number,
}

export class WalletManager {
  encryptedMasterKey: any
  internalChain: AddressChain
  externalChain: AddressChain

  perAddressSyncMetadata: {[string]: SyncMetadata}
  transactions: {[string]: RawTransaction}
  seenAddresses: Set<string>

  generatedAddressCount: number

  isInitialized: boolean
  doFullSyncMutex: Mutex
  restoreMutex: Mutex

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
    this.perAddressSyncMetadata = {}
    this.seenAddresses = new Set()
    this.generatedAddressCount = 0

    this.isInitialized = false
    this.doFullSyncMutex = {name: 'doFullSyncMutex', lock: null}
    this.restoreMutex = {name: 'restoreMutex', lock: null}
  }

  _getAccount(masterKey) {
    return util.getAccountFromMasterKey(masterKey)
  }

  restoreWallet(mnemonic: string, newPassword: string) {
    return synchronize(this.restoreMutex, () =>
      this._restoreWallet(mnemonic, newPassword),
    )
  }

  async _restoreWallet(mnemonic: string, newPassword: string) {
    Logger.info('restore wallet')
    assert.assert(!this.isInitialized, 'restoreWallet: !isInitialized')
    const masterKey = await util.getMasterKeyFromMnemonic(mnemonic)
    const account = await this._getAccount(masterKey)
    this.encryptedMasterKey = await util.encryptMasterKey(
      newPassword,
      masterKey,
    )

    // initialize address chains
    this.internalChain = new AddressChain(
      (ids) => util.getInternalAddresses(account, ids),
      api.filterUsedAddresses,
    )
    this.externalChain = new AddressChain(
      (ids) => util.getExternalAddresses(account, ids),
      api.filterUsedAddresses,
    )

    // We want to monitor all new addresses
    this.internalChain.addSubscriberToNewAddresses(
      this.createMetadataForAddresses.bind(this),
    )
    this.externalChain.addSubscriberToNewAddresses(
      this.createMetadataForAddresses.bind(this),
    )

    // Create at least one address in each block
    await this.internalChain.initialize()
    await this.externalChain.initialize()

    // We should start with 1 generated address
    this.generatedAddressCount = 1

    this.isInitialized = true
  }

  // TODO(ppershing): remove this once we can "open"
  // saved wallet from device store
  async __initTestWalletIfNeeded() {
    if (this.isInitialized) return
    const mnemonic = [
      'dry balcony arctic what garbage sort',
      'cart shine egg lamp manual bottom',
      'slide assault bus',
    ].join(' ')
    await this.restoreWallet(mnemonic, '')
  }

  async doFullSync() {
    return await synchronize(this.doFullSyncMutex, () => this._doFullSync())
  }

  async tryDoFullSync() {
    try {
      return await nonblockingSynchronize(this.doFullSyncMutex, () =>
        this._doFullSync(),
      )
    } catch (e) {
      if (e instanceof IsLockedError) {
        return null
      } else {
        throw e
      }
    }
  }

  async _doFullSync() {
    await this.__initTestWalletIfNeeded()
    Logger.info('Do full sync')
    assert.assert(this.isInitialized, 'doFullSync: isInitialized')
    await Promise.all([this.internalChain.sync(), this.externalChain.sync()])
    Logger.info('Discovery done, now syncing transactions')
    let keepGoing = true
    while (keepGoing) {
      keepGoing = await this.doSyncStep([
        ...this.internalChain.getBlocks(),
        ...this.externalChain.getBlocks(),
      ])
    }

    return {...this.transactions}
  }

  getOwnAddresses() {
    if (this.isInitialized) {
      return [
        ...this.internalChain.getAddresses(),
        ...this.externalChain.getAddresses(),
      ]
    }

    return []
  }

  getUiReceiveAddresses() {
    assert.assert(this.isInitialized, 'getUiReceiveAddresses:: isInitialized')
    assert.assert(
      this.generatedAddressCount <= this.externalChain.size(),
      'getUiReceiveAddresses:: count',
    )
    const addresses = this.externalChain
      .getAddresses()
      .slice(0, this.generatedAddressCount)
    return addresses.map((address) => ({
      address,
      isUsed: this.seenAddresses.has(address),
    }))
  }

  generateNewUiReceiveAddress(): boolean {
    // TODO(ppershing): use "assuredly used" instead of "seen"
    const usedCount = this.externalChain
      .getAddresses()
      .slice(0, this.generatedAddressCount)
      .filter((address) => this.seenAddresses.has(address)).length

    if (
      usedCount + CONFIG.WALLET.MAX_GENERATED_UNUSED <=
      this.generatedAddressCount
    ) {
      return false
    }
    this.generatedAddressCount += 1
    return true
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
    tx.inputs_address.forEach((a) => {
      this.seenAddresses.add(a)
    })
    tx.outputs_address.forEach((a) => {
      this.seenAddresses.add(a)
    })

    // TODO(ppershing): make sure everyting above this line is ok with old
    // content of this.transactions[id] !
    this.transactions[id] = tx
    return true
  }

  // Returns number of updated transactions
  _updateTransactions(transactions: Array<RawTransaction>): number {
    Logger.debug('_updateTransactions', transactions)
    const updated = transactions.map((t) => this._didProcessTransaction(t))
    return _.sum(updated, (x) => (x ? 1 : 0))
  }

  createMetadataForAddresses(addrs: Array<string>) {
    addrs.forEach((a) => {
      assert.assert(
        _.isUndefined(this.perAddressSyncMetadata[a]),
        'createMetadataForAddresses: new addresses',
      )
      this.perAddressSyncMetadata[a] = {
        lastUpdated: moment(0),
        bestBlockNum: 0,
      }
    })
  }

  getBlockMetadata(addrs: Array<string>) {
    assert.assert(addrs.length, 'getBlockMetadata: addrs not empty')
    const metadata = addrs.map((a) => this.perAddressSyncMetadata[a])
    // check consistency
    assert.assert(
      metadata,
      'getBlockMetadata: metadata should not be undefined',
    )
    assert.assert(
      metadata.every((x) => x.lastUpdated.isSame(metadata[0].lastUpdated)),
      'getBlockMetadata: metadata same',
    )
    assert.assert(
      metadata.every((x) => x.bestBlockNum === metadata[0].bestBlockNum),
      'getBlockMetadata: metadata same',
    )

    return metadata[0]
  }

  async doSyncStep(blocks: Array<Array<string>>): Promise<boolean> {
    Logger.info('doSyncStep', blocks)
    let count = 0
    let wasPaginated = false
    const errors = []

    const tasks = blocks.map((addrs) => {
      const metadata = this.getBlockMetadata(addrs)
      return () =>
        api
          .fetchNewTxHistory(metadata.lastUpdated, addrs)
          .then((response) => [addrs, response])
    })

    const limit = limitConcurrency(CONFIG.MAX_CONCURRENT_REQUESTS)

    const promises = tasks.map((t) => limit(t))

    // Note(ppershing): This serializes the respons order
    // but still allows for concurrent requests
    for (const promise of promises) {
      try {
        const [addrs, response] = await promise
        count += this._updateTransactions(response.transactions)
        wasPaginated = wasPaginated || !response.isLast
        // Note: this needs to happen *after* updating
        // transactions in case the former fails!

        const metadata = this.getBlockMetadata(addrs)
        const newLastUpdated = getLastTimestamp(response.transactions)
        // Not used right now
        const newBestBlockNum =
          response.isLast && response.transactions.length
            ? response.transactions[0].best_block_num
            : metadata.bestBlockNum

        // TODO(ppershing): assert on concurrent metadata modifications
        addrs.forEach((a) => {
          this.perAddressSyncMetadata[a] = {
            lastUpdated: newLastUpdated,
            bestBlockNum: newBestBlockNum,
          }
        })
      } catch (e) {
        errors.push(e)
      }
    }

    if (errors.length) throw errors
    return wasPaginated || count > 0
  }

  transformUtxoToInput(utxo: RawUtxo): TransactionInput {
    const chains = [
      [util.ADDRESS_TYPE_INDEX.INTERNAL, this.internalChain],
      [util.ADDRESS_TYPE_INDEX.EXTERNAL, this.externalChain],
    ]

    let addressInfo = null
    chains.forEach(([type, chain]) => {
      if (chain.isMyAddress(utxo.receiver)) {
        addressInfo = {type, index: chain.getIndexOfAddress(utxo.receiver)}
      }
    })

    /* :: if (!addressInfo) throw 'assert' */
    assert.assert(addressInfo, `Address not found for utxo: ${utxo.receiver}`)

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
        change: addressInfo.type,
        index: addressInfo.index,
      },
    }
  }

  getChangeAddress() {
    const candidateAddresses = this.internalChain.getAddresses()
    const unseen = candidateAddresses.filter(
      (addr) => !this.seenAddresses.has(addr),
    )
    assert.assert(unseen.length > 0, 'Cannot find change address')
    return _.first(unseen)
  }

  async prepareTransaction(
    receiverAddress: string,
    amount: BigNumber,
  ): Promise<PreparedTransactionData> {
    // For now we do not support custom sender so we query all addresses
    const utxos = await api.bulkFetchUTXOsForAddresses(this.getOwnAddresses())
    const inputs = utxos.map((utxo) => this.transformUtxoToInput(utxo))

    const outputs = [{address: receiverAddress, value: amount.toString()}]
    const changeAddress = this.getChangeAddress()
    const fakeWallet = await util.generateFakeWallet()
    const fakeTx = await util.signTransaction(
      fakeWallet,
      inputs,
      outputs,
      changeAddress,
    )
    Logger.info(inputs)
    Logger.info(outputs)
    Logger.info(changeAddress)

    return {
      inputs,
      outputs,
      changeAddress,
      fee: fakeTx.fee,
    }
  }

  async submitTransaction(
    transaction: PreparedTransactionData,
    password: string,
  ) {
    const {inputs, outputs, changeAddress, fee} = transaction

    const decryptedMasterKey = await util.decryptMasterKey(
      password,
      this.encryptedMasterKey,
    )
    const signedTxData = await util.signTransaction(
      await util.getWalletFromMasterKey(decryptedMasterKey),
      inputs,
      outputs,
      changeAddress,
    )

    assert.assert(fee.eq(signedTxData.fee), 'Transaction fee does not match')

    const signedTx = Buffer.from(signedTxData.cbor_encoded_tx, 'hex').toString(
      'base64',
    )
    const response = await api.submitTransaction(signedTx)
    Logger.info(response)
    return response
  }
}

export default new WalletManager()
