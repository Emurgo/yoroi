// @flow

import moment from 'moment'
import _ from 'lodash'
import {BigNumber} from 'bignumber.js'
import {defaultMemoize} from 'reselect'

import {AddressChain} from './chain'
import * as util from './util'
import {ObjectValues} from '../utils/flow'
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
import {TRANSACTION_STATUS} from '../types/HistoryTransaction'

import type {Moment} from 'moment'
import type {
  Transaction,
  RawUtxo,
  TransactionInput,
  PreparedTransactionData,
} from '../types/HistoryTransaction'
import type {Dict} from '../state'

import type {Mutex} from '../utils/promise'

const getLastTimestamp = (history: Array<Transaction>): ?Moment => {
  // Note(ppershing): ISO8601 dates can be sorted as strings
  // and the result is expected
  return _.max(history.map((tx) => tx.lastUpdatedAt), moment(0))
}

type SyncMetadata = {
  lastUpdated: Moment,
  bestBlockNum: number,
}

type WalletHistoryState = {
  transactions: Dict<Transaction>,
  perAddressSyncMetadata: Dict<SyncMetadata>,
  generatedAddressCount: number,
}

const perAddressTxsSelector = (state: WalletHistoryState) => {
  const transactions = state.transactions
  const addressToTxs = {}
  const addTxTo = (txId, addr) => {
    const current = addressToTxs[addr] || []
    const cleared = current.filter((_txId) => txId !== _txId)
    addressToTxs[addr] = [...cleared, txId]
  }

  ObjectValues(transactions).forEach((tx) => {
    tx.inputs.forEach(({address}) => {
      addTxTo(tx.id, address)
    })
    tx.outputs.forEach(({address}) => {
      addTxTo(tx.id, address)
    })
  })
  return addressToTxs
}

const confirmationCountsSelector = (state: WalletHistoryState) => {
  const {perAddressSyncMetadata, transactions} = state
  return _.mapValues(transactions, (tx: Transaction) => {
    if (tx.status !== TRANSACTION_STATUS.SUCCESSFUL) {
      // TODO(ppershing): do failed transactions have assurance?
      return null
    }

    const getBlockNum = ({address}) =>
      perAddressSyncMetadata[address]
        ? perAddressSyncMetadata[address].bestBlockNum
        : 0

    const bestBlockNum = _.max([
      tx.bestBlockNum,
      ...tx.inputs.map(getBlockNum),
      ...tx.outputs.map(getBlockNum),
    ])

    assert.assert(tx.blockNum, 'Successfull tx should have blockNum')
    /* :: if (!tx.blockNum) throw 'assert' */
    return bestBlockNum - tx.blockNum
  })
}

export class WalletManager {
  _encryptedMasterKey: any
  _internalChain: AddressChain
  _externalChain: AddressChain

  _state: WalletHistoryState

  _isInitialized: boolean
  _doFullSyncMutex: Mutex
  _restoreMutex: Mutex
  _perAddressTxsSelector: any
  _confirmationCountsSelector: any
  _subscriptions: Array<() => any>

  constructor() {
    this._encryptedMasterKey = null
    // $FlowFixMe
    this._internalChain = null
    // $FlowFixMe
    this._externalChain = null
    this._state = {
      transactions: {},
      perAddressSyncMetadata: {},
      generatedAddressCount: 0,
    }

    this._isInitialized = false
    this._doFullSyncMutex = {name: 'doFullSyncMutex', lock: null}
    this._restoreMutex = {name: 'restoreMutex', lock: null}
    this._perAddressTxsSelector = defaultMemoize(perAddressTxsSelector)
    this._confirmationCountsSelector = defaultMemoize(
      confirmationCountsSelector,
    )
    this._subscriptions = []
  }

  /* global $Shape */
  updateState(update: $Shape<WalletHistoryState>) {
    Logger.debug('WalletManager update state')
    Logger.debug('Update', update)

    this._state = {
      ...this._state,
      ...update,
    }

    this._subscriptions.forEach((handler) => handler())
  }

  subscribe(handler: () => any) {
    this._subscriptions.push(handler)
  }

  get perAddressTxs() {
    return this._perAddressTxsSelector(this._state)
  }

  get transactions() {
    return this._state.transactions
  }

  get confirmationCounts() {
    return this._confirmationCountsSelector(this._state)
  }

  _getAccount(masterKey) {
    return util.getAccountFromMasterKey(masterKey)
  }

  restoreWallet(mnemonic: string, newPassword: string) {
    return synchronize(this._restoreMutex, () =>
      this._restoreWallet(mnemonic, newPassword),
    )
  }

  async _restoreWallet(mnemonic: string, newPassword: string) {
    Logger.info('restore wallet')
    assert.assert(!this._isInitialized, 'restoreWallet: !isInitialized')
    const masterKey = await util.getMasterKeyFromMnemonic(mnemonic)
    const account = await this._getAccount(masterKey)
    this._encryptedMasterKey = await util.encryptMasterKey(
      newPassword,
      masterKey,
    )

    // initialize address chains
    this._internalChain = new AddressChain((ids) =>
      util.getInternalAddresses(account, ids),
    )
    this._externalChain = new AddressChain((ids) =>
      util.getExternalAddresses(account, ids),
    )

    // We want to monitor all new addresses
    this._internalChain.addSubscriberToNewAddresses(
      this.onDiscoveredAddresses.bind(this),
    )
    this._externalChain.addSubscriberToNewAddresses(
      this.onDiscoveredAddresses.bind(this),
    )

    // Create at least one address in each block
    await this._internalChain.initialize()
    await this._externalChain.initialize()

    // We should start with 1 generated address
    this.updateState({
      generatedAddressCount: 1,
    })

    this._isInitialized = true
  }

  onDiscoveredAddresses(addresses: Array<string>) {
    this.createMetadataForAddresses(addresses)
    // broadcast change
    this.updateState({})
  }

  // TODO(ppershing): remove this once we can "open"
  // saved wallet from device store
  async __initTestWalletIfNeeded() {
    if (this._isInitialized) return
    const mnemonic = [
      'dry balcony arctic what garbage sort',
      'cart shine egg lamp manual bottom',
      'slide assault bus',
    ].join(' ')
    await this.restoreWallet(mnemonic, '')
  }

  async doFullSync() {
    return await synchronize(this._doFullSyncMutex, () => this._doFullSync())
  }

  async tryDoFullSync() {
    try {
      return await nonblockingSynchronize(this._doFullSyncMutex, () =>
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
    assert.assert(this._isInitialized, 'doFullSync: isInitialized')
    await Promise.all([
      this._internalChain.sync(api.filterUsedAddresses),
      this._externalChain.sync(api.filterUsedAddresses),
    ])
    Logger.info('Discovery done, now syncing transactions')
    let keepGoing = true
    while (keepGoing) {
      keepGoing = await this.doSyncStep([
        ...this._internalChain.getBlocks(),
        ...this._externalChain.getBlocks(),
      ])
    }

    return {...this._state.transactions}
  }

  // TODO(ppershing): memoize
  getOwnAddresses() {
    if (this._isInitialized) {
      return [
        ...this._internalChain.addresses,
        ...this._externalChain.addresses,
      ]
    }

    return []
  }

  getUiReceiveAddresses() {
    if (!this._isInitialized) return []

    assert.assert(
      this._state.generatedAddressCount <= this._externalChain.size(),
      'getUiReceiveAddresses:: count',
    )
    const addresses = this._externalChain.addresses.slice(
      0,
      this._state.generatedAddressCount,
    )
    return addresses.map((address) => ({
      address,
      isUsed: this.isUsedAddress(address),
    }))
  }

  isUsedAddress(address: string) {
    return (
      !!this.perAddressTxs[address] && this.perAddressTxs[address].length > 0
    )
  }

  generateNewUiReceiveAddress(): boolean {
    // TODO(ppershing): use "assuredly used" instead of "seen"
    const usedCount = this._externalChain.addresses
      .slice(0, this._state.generatedAddressCount)
      .filter((address) => this.isUsedAddress(address)).length

    if (
      usedCount + CONFIG.WALLET.MAX_GENERATED_UNUSED <=
      this._state.generatedAddressCount
    ) {
      return false
    }
    this.updateState({
      generatedAddressCount: this._state.generatedAddressCount + 1,
    })

    return true
  }

  _isUpdatedTransaction(tx: Transaction): boolean {
    const id = tx.id
    // We have this transaction and it did not change
    if (
      this._state.transactions[id] &&
      this._state.transactions[id].lastUpdatedAt.isSame(tx.lastUpdatedAt)
    ) {
      return false
    }
    if (this._state.transactions[id]) {
      // Do things that matter if the transaction changed!
      Logger.info('Tx changed', tx)
    }
    return true
  }

  // Returns number of updated transactions
  _checkUpdatedTransactions(transactions: Array<Transaction>): number {
    Logger.debug('_updateTransactions', transactions)
    // Currently we do not support two updates inside a same batch
    // (and backend shouldn't support it either)
    assert.assert(
      transactions.length === _.uniq(transactions.map((tx) => tx.id)).length,
      'Got the same transaction twice in one batch',
    )
    const updated = transactions.map((tx) => this._isUpdatedTransaction(tx))
    return _.sum(updated, (x) => (x ? 1 : 0))
  }

  createMetadataForAddresses(addrs: Array<string>) {
    addrs.forEach((addr) => {
      assert.assert(
        _.isUndefined(this._state.perAddressSyncMetadata[addr]),
        'createMetadataForAddresses: new addresses',
      )
    })

    const newMetadata = _.fromPairs(
      addrs.map((addr) => [
        addr,
        {
          lastUpdated: moment(0),
          bestBlockNum: 0,
        },
      ]),
    )

    this.updateState({
      perAddressSyncMetadata: {
        ...this._state.perAddressSyncMetadata,
        ...newMetadata,
      },
    })
  }

  _getBlockMetadata(addrs: Array<string>) {
    assert.assert(addrs.length, 'getBlockMetadata: addrs not empty')
    const metadata = addrs.map(
      (addr) => this._state.perAddressSyncMetadata[addr],
    )
    // check consistency
    assert.assert(
      metadata,
      'getBlockMetadata: metadata should not be undefined',
    )
    assert.assert(
      metadata.every((x) => x.lastUpdated.isSame(metadata[0].lastUpdated)),
      'getBlockMetadata: lastUpdated metadata same',
    )
    assert.assert(
      metadata.every((x) => x.bestBlockNum === metadata[0].bestBlockNum),
      'getBlockMetadata: bestBlockNum metadata same',
    )

    return metadata[0]
  }

  async doSyncStep(blocks: Array<Array<string>>): Promise<boolean> {
    Logger.info('doSyncStep', blocks)
    let count = 0
    let wasPaginated = false
    const errors = []

    const tasks = blocks.map((addrs) => {
      const metadata = this._getBlockMetadata(addrs)
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
        wasPaginated = wasPaginated || !response.isLast
        const metadata = this._getBlockMetadata(addrs)
        const newLastUpdated = getLastTimestamp(response.transactions)
        // Note: we can update best block number only if we are processing
        // the last page of the history request, see design doc for details
        const newBestBlockNum =
          response.isLast && response.transactions.length
            ? response.transactions[0].bestBlockNum
            : metadata.bestBlockNum

        const newMetadata = {
          lastUpdated: newLastUpdated,
          bestBlockNum: newBestBlockNum,
        }

        const transactionsUpdate = _.fromPairs(
          response.transactions.map((tx) => [tx.id, tx]),
        )
        const metadataUpdate = _.fromPairs(
          addrs.map((addr) => [addr, newMetadata]),
        )

        count += this._checkUpdatedTransactions(response.transactions)

        this.updateState({
          transactions: {...this._state.transactions, ...transactionsUpdate},
          perAddressSyncMetadata: {
            ...this._state.perAddressSyncMetadata,
            ...metadataUpdate,
          },
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
      [util.ADDRESS_TYPE_INDEX.INTERNAL, this._internalChain],
      [util.ADDRESS_TYPE_INDEX.EXTERNAL, this._externalChain],
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
    const candidateAddresses = this._internalChain.addresses
    const unseen = candidateAddresses.filter(
      (addr) => !this.isUsedAddress(addr),
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
      this._encryptedMasterKey,
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
