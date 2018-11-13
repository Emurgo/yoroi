// @flow

import _ from 'lodash'
import {BigNumber} from 'bignumber.js'
import {defaultMemoize} from 'reselect'
import uuid from 'uuid'

import storage from '../utils/storage'
import {AddressChain, AddressGenerator} from './chain'
import * as util from './util'
import api from '../api'
import {CONFIG} from '../config'
import assert from '../utils/assert'
import {Logger} from '../utils/logging'
import {
  synchronize,
  nonblockingSynchronize,
  IsLockedError,
} from '../utils/promise'
import {TransactionCache} from './transactionCache'

import type {
  RawUtxo,
  TransactionInput,
  PreparedTransactionData,
} from '../types/HistoryTransaction'
import type {Mutex} from '../utils/promise'

type WalletState = {|
  lastGeneratedAddressIndex: number,
|}

const ownAddressesSelector = (
  internal: Array<string>,
  external: Array<string>,
) => [...internal, ...external]

export class Wallet {
  _encryptedMasterKey: any = null
  // $FlowFixMe null
  _internalChain: AddressChain = null
  // $FlowFixMe null
  _externalChain: AddressChain = null

  _state: WalletState = {
    lastGeneratedAddressIndex: -1,
  }

  _isInitialized: boolean = false
  _doFullSyncMutex: Mutex = {name: 'doFullSyncMutex', lock: null}
  _subscriptions: Array<(Wallet) => any> = []
  // $FlowFixMe null
  _transactionCache: TransactionCache = null
  _ownAddressesSelector = defaultMemoize(ownAddressesSelector)

  /* global $Shape */
  updateState(update: $Shape<WalletState>) {
    Logger.debug('WalletManager update state')
    Logger.debug('Update', update)

    this._state = {
      ...this._state,
      ...update,
    }

    this.notify()
  }

  // needs to be bound
  notify = () => {
    this._subscriptions.forEach((handler) => handler(this))
  }

  subscribe(handler: (Wallet) => any) {
    this._subscriptions.push(handler)
  }

  get transactions() {
    return this._transactionCache.transactions
  }

  get confirmationCounts() {
    return this._transactionCache.confirmationCounts
  }

  _setupSubscriptions() {
    this._transactionCache.subscribe(this.notify)
    this._internalChain.addSubscriberToNewAddresses(this.notify)
    this._externalChain.addSubscriberToNewAddresses(this.notify)
  }

  async _create(mnemonic: string, newPassword: string) {
    Logger.info('create wallet')
    assert.assert(!this._isInitialized, 'createWallet: !isInitialized')
    const masterKey = await util.getMasterKeyFromMnemonic(mnemonic)
    const account = await util.getAccountFromMasterKey(masterKey)
    this._encryptedMasterKey = await util.encryptMasterKey(
      masterKey,
      newPassword,
    )

    this._transactionCache = new TransactionCache()

    // initialize address chains
    this._internalChain = new AddressChain(
      new AddressGenerator(account, 'Internal'),
    )
    this._externalChain = new AddressChain(
      new AddressGenerator(account, 'External'),
    )

    // Create at least one address in each block
    await this._internalChain.initialize()
    await this._externalChain.initialize()

    this._setupSubscriptions()
    this.notify()

    this._isInitialized = true
  }

  _restore(data) {
    Logger.info('restore wallet')
    assert.assert(!this._isInitialized, 'restoreWallet: !isInitialized')
    this._state = {
      lastGeneratedAddressIndex: data.lastGeneratedAddressIndex,
    }
    this._internalChain = AddressChain.fromJSON(data.internalChain)
    this._externalChain = AddressChain.fromJSON(data.externalChain)
    this._transactionCache = TransactionCache.fromJSON(data.transactionCache)
    this._encryptedMasterKey = data.encryptedMasterKey

    // subscriptions
    this._setupSubscriptions()

    this._isInitialized = true
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
    Logger.info('Do full sync')
    assert.assert(this._isInitialized, 'doFullSync: isInitialized')
    await Promise.all([
      this._internalChain.sync(api.filterUsedAddresses),
      this._externalChain.sync(api.filterUsedAddresses),
    ])
    Logger.info('Discovery done, now syncing transactions')
    let keepGoing = true
    while (keepGoing) {
      keepGoing = await this._transactionCache.doSyncStep([
        ...this._internalChain.getBlocks(),
        ...this._externalChain.getBlocks(),
      ])
    }

    return this._transactionCache.transactions
  }

  // TODO(ppershing): memoize
  getOwnAddresses() {
    assert.assert(this._isInitialized, 'getOwnAddresses:: isInitialized')

    return this._ownAddressesSelector(
      this._internalChain.addresses,
      this._externalChain.addresses,
    )
  }

  // TODO(ppershing): memoize
  getUiReceiveAddresses() {
    assert.assert(this._isInitialized, 'getUiReceiveAddresses:: isInitialized')

    assert.assert(
      this._state.lastGeneratedAddressIndex < this._externalChain.size(),
      'getUiReceiveAddresses:: count',
    )
    const addresses = this._externalChain.addresses.slice(
      0,
      this._state.lastGeneratedAddressIndex + 1,
    )
    return addresses.map((address, index) => ({
      index,
      address,
      isUsed: this.isUsedAddress(address),
    }))
  }

  isUsedAddress(address: string) {
    return (
      !!this._transactionCache.perAddressTxs[address] &&
      this._transactionCache.perAddressTxs[address].length > 0
    )
  }

  canGenerateNewReceiveAddress() {
    // TODO(ppershing): use "assuredly used" instead of "seen"
    const usedCount = this._externalChain.addresses
      .slice(0, this._state.lastGeneratedAddressIndex + 1)
      .filter((address) => this.isUsedAddress(address)).length

    return (
      this._state.lastGeneratedAddressIndex + 1 <
      usedCount + CONFIG.WALLET.MAX_GENERATED_UNUSED
    )
  }

  async generateNewUiReceiveAddress(): Promise<boolean> {
    if (!this.canGenerateNewReceiveAddress()) return false

    let idx = this._state.lastGeneratedAddressIndex + 1
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // First, discover new addresses if needed.
      // This can happen if last address sync/discovery failed
      // but transaction sync went through
      if (idx >= this._externalChain.addresses.length) {
        const filterUsed = (addresses) =>
          Promise.resolve(
            addresses.filter((address) => this.isUsedAddress(address)),
          )
        await this._externalChain.sync(filterUsed)
      }
      if (!this.isUsedAddress(this._externalChain.addresses[idx])) break
      idx += 1
    }

    this.updateState({
      lastGeneratedAddressIndex: idx,
    })

    return true
  }

  transformUtxoToInput(utxo: RawUtxo): TransactionInput {
    const chains = [
      ['Internal', this._internalChain],
      ['External', this._externalChain],
    ]

    let addressInfo = null
    chains.forEach(([type, chain]) => {
      if (chain.isMyAddress(utxo.receiver)) {
        addressInfo = {
          change: util.ADDRESS_TYPE_TO_CHANGE[type],
          index: chain.getIndexOfAddress(utxo.receiver),
        }
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
        change: addressInfo.change,
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
    utxos: Array<RawUtxo>,
    receiverAddress: string,
    amount: BigNumber,
  ): Promise<PreparedTransactionData> {
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
    Logger.debug(inputs)
    Logger.debug(outputs)
    Logger.debug(changeAddress)

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
      this._encryptedMasterKey,
      password,
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

  toJSON() {
    return {
      lastGeneratedAddressIndex: this._state.lastGeneratedAddressIndex,
      internalChain: this._internalChain.toJSON(),
      externalChain: this._externalChain.toJSON(),
      transactionCache: this._transactionCache.toJSON(),
      // TODO(ppershing): move this to keystore
      encryptedMasterKey: this._encryptedMasterKey,
    }
  }
}

class WalletManager {
  _wallet: ?Wallet = null
  _id: string = ''
  _subscribers: Array<() => any> = []
  _syncErrorSubscribers: Array<(err: any) => any> = []

  constructor() {
    this._backgroundSync()
  }

  // Note(ppershing): needs 'this' to be bound
  _notify = () => {
    // TODO(ppershing): do this in next tick?
    this._subscribers.forEach((handler) => handler())
  }

  _notifySyncError = (error: any) => {
    this._syncErrorSubscribers.forEach((handler) => handler(error))
  }

  async _backgroundSync() {
    try {
      if (this._wallet) {
        await this._wallet.tryDoFullSync()
        await this.saveState()
      }
      this._notifySyncError(null)
    } catch (e) {
      this._notifySyncError(e)
    } finally {
      setTimeout(() => this._backgroundSync(), CONFIG.HISTORY_REFRESH_TIME)
    }
  }

  subscribe(handler: () => any) {
    this._subscribers.push(handler)
  }

  subscribeBackgroundSyncError(handler: (err: any) => any) {
    this._syncErrorSubscribers.push(handler)
  }

  get isInitialized() {
    return this._wallet
  }

  get transactions() {
    if (!this._wallet) return {}
    return this._wallet.transactions
  }

  get ownAddresses() {
    if (!this._wallet) return []
    return this._wallet.getOwnAddresses()
  }

  get confirmationCounts() {
    if (!this._wallet) return {}
    return this._wallet.confirmationCounts
  }

  get receiveAddresses() {
    if (!this._wallet) return []
    return this._wallet.getUiReceiveAddresses()
  }

  get canGenerateNewReceiveAddress() {
    if (!this._wallet) return false
    return this._wallet.canGenerateNewReceiveAddress()
  }

  async generateNewUiReceiveAddressIfNeeded() {
    if (!this._wallet) return
    if (
      this._wallet.getUiReceiveAddresses().filter(({isUsed}) => !isUsed)
        .length > 0
    ) {
      return // nothing to do
    }
    /* :: if (!this._wallet) throw 'assert' */
    await this.generateNewUiReceiveAddress()
  }

  async generateNewUiReceiveAddress() {
    if (!this._wallet) return false
    const didGenerateNew = await this._wallet.generateNewUiReceiveAddress()
    // TODO(ppershing): saveState
    return didGenerateNew
  }

  async doFullSync() {
    // TODO(ppershing): this should "quit" early if we change wallet
    if (!this._wallet) return
    await this._wallet.doFullSync()
    // TODO(ppershing): should we make save a runaway promise?
    await this.saveState()
    return
  }

  async prepareTransaction(
    utxos: Array<RawUtxo>,
    address: string,
    amount: BigNumber,
  ) {
    if (!this._wallet) throw new Error()
    return await this._wallet.prepareTransaction(utxos, address, amount)
  }

  async submitTransaction(
    transactionData: PreparedTransactionData,
    password: string,
  ) {
    if (!this._wallet) throw new Error()
    return await this._wallet.submitTransaction(transactionData, password)
  }

  async createWallet(
    name: string,
    mnemonic: string,
    password: string,
  ): Promise<Wallet> {
    const id = uuid.v4()
    // Ignore id & name for now
    const wallet = new Wallet()
    await wallet._create(mnemonic, password)

    // TODO(ppershing): potential inconsistency between id and _wallet
    this._id = id
    await this.saveState()
    this._wallet = wallet
    wallet.subscribe(this._notify)
    this._notify()
    await storage.write(`/wallet/${id}`, {id, name})
    return wallet
  }

  async openWallet(id: string): Promise<Wallet> {
    assert.preconditionCheck(!!id, 'openWallet:: !!id')
    const wallet = new Wallet()
    const data = await storage.read(`/wallet/${id}/data`)

    if (!data) throw new Error()

    wallet._restore(data)
    this._wallet = wallet
    this._id = id
    wallet.subscribe(this._notify)
    this._notify()
    return wallet
  }

  async saveState() {
    if (!this._wallet) return
    assert.assert(this._id, 'saveState:: id')
    /* :: if (!this._wallet) throw 'assert' */
    const data = this._wallet.toJSON()
    await storage.write(`/wallet/${this._id}/data`, data)
  }

  async listWallets() {
    const keys = await storage.keys('/wallet/')
    const result = await Promise.all(
      keys.map((key) => storage.read(`/wallet/${key}`)),
    )
    return result
  }
}

export default new WalletManager()
