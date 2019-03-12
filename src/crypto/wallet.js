// @flow

import _ from 'lodash'
import {BigNumber} from 'bignumber.js'
import {defaultMemoize} from 'reselect'
import uuid from 'uuid'
import ExtendableError from 'es6-error'

import storage from '../utils/storage'
import KeyStore from './KeyStore'
import {AddressChain, AddressGenerator} from './chain'
import * as util from './util'
import api from '../api'
import {CONFIG} from '../config'
import assert from '../utils/assert'
import {ObjectValues} from '../utils/flow'
import {Logger} from '../utils/logging'
import {
  synchronize,
  nonblockingSynchronize,
  IsLockedError,
} from '../utils/promise'
import {TransactionCache} from './transactionCache'
import {validatePassword} from '../utils/validators'
import {
  canBiometricEncryptionBeEnabled,
  isSystemAuthSupported,
} from '../helpers/deviceSettings'

import type {
  RawUtxo,
  TransactionInput,
  PreparedTransactionData,
} from '../types/HistoryTransaction'
import type {Mutex} from '../utils/promise'

export type EncryptionMethod = 'BIOMETRICS' | 'SYSTEM_PIN' | 'MASTER_PASSWORD'

type WalletState = {|
  lastGeneratedAddressIndex: number,
|}

export class Wallet {
  // $FlowFixMe null
  _id: string = null

  _isEasyConfirmationEnabled: boolean = false

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
  _isUsedAddressIndexSelector = defaultMemoize((perAddressTxs) =>
    _.mapValues(perAddressTxs, (txs) => {
      assert.assert(!!txs, 'perAddressTxs cointains false-ish value')
      return txs.length > 0
    }),
  )

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

  async encryptAndSaveMasterKey(
    encryptionMethod: EncryptionMethod,
    masterKey: string,
    password?: string,
  ) {
    await KeyStore.storeData(this._id, encryptionMethod, masterKey, password)
  }

  async getDecryptedMasterKey(masterPassword: string, intl: any) {
    return await KeyStore.getData(
      this._id,
      'MASTER_PASSWORD',
      '',
      masterPassword,
      intl,
    )
  }

  async enableEasyConfirmation(masterPassword: string, intl: any) {
    const decryptedMasterKey = await this.getDecryptedMasterKey(
      masterPassword,
      intl,
    )

    await this.encryptAndSaveMasterKey('BIOMETRICS', decryptedMasterKey)
    await this.encryptAndSaveMasterKey('SYSTEM_PIN', decryptedMasterKey)

    // $FlowFixMe
    this._isEasyConfirmationEnabled = true
  }

  async changePassword(masterPassword: string, newPassword: string, intl: any) {
    const isNewPasswordValid = _.isEmpty(
      validatePassword(newPassword, newPassword),
    )

    if (!isNewPasswordValid) {
      throw new Error('New password is not valid')
    }

    const masterKey = await this.getDecryptedMasterKey(masterPassword, intl)

    await this.encryptAndSaveMasterKey(
      'MASTER_PASSWORD',
      masterKey,
      newPassword,
    )
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
    this._id = uuid.v4()
    assert.assert(!this._isInitialized, 'createWallet: !isInitialized')
    const masterKey = await util.getMasterKeyFromMnemonic(mnemonic)
    const account = await util.getAccountFromMasterKey(masterKey)
    await this.encryptAndSaveMasterKey(
      'MASTER_PASSWORD',
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
    return this._id
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
    this._isEasyConfirmationEnabled = data.isEasyConfirmationEnabled

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

  get internalAddresses() {
    return this._internalChain.addresses
  }

  get externalAddresses() {
    return this._externalChain.addresses
  }

  isUsedAddress(address: string) {
    return (
      !!this._transactionCache.perAddressTxs[address] &&
      this._transactionCache.perAddressTxs[address].length > 0
    )
  }

  get isUsedAddressIndex() {
    return this._isUsedAddressIndexSelector(
      this._transactionCache.perAddressTxs,
    )
  }

  get numReceiveAddresses() {
    return this._state.lastGeneratedAddressIndex + 1
  }

  canGenerateNewReceiveAddress() {
    // TODO(ppershing): use "assuredly used" instead of "seen"
    const usedCount = this.externalAddresses
      .slice(0, this.numReceiveAddresses)
      .filter((address) => this.isUsedAddress(address)).length

    return (
      this.numReceiveAddresses < usedCount + CONFIG.WALLET.MAX_GENERATED_UNUSED
    )
  }

  async generateNewUiReceiveAddressIfNeeded() {
    if (
      this.externalAddresses
        .slice(0, this.numReceiveAddresses)
        .some((addr) => !this.isUsedAddress(addr))
    ) {
      return false // still have some unused
    }
    return await this.generateNewUiReceiveAddress()
  }

  async generateNewUiReceiveAddress(): Promise<boolean> {
    if (!this.canGenerateNewReceiveAddress()) return false

    let idx = this.numReceiveAddresses
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

    const outputs = [{address: receiverAddress, value: amount.toFixed(0)}]
    const changeAddress = this.getChangeAddress()
    const fakeWallet = await util.generateFakeWallet()
    const fakeTx = await util.signTransaction(
      fakeWallet,
      inputs,
      outputs,
      changeAddress,
    )
    Logger.debug('Inputs', inputs)
    Logger.debug('Outputs', outputs)
    Logger.debug('Change address', changeAddress)

    return {
      inputs,
      outputs,
      changeAddress,
      fee: fakeTx.fee,
    }
  }

  async signTx(
    transaction: PreparedTransactionData,
    decryptedMasterKey: string,
  ) {
    const {inputs, outputs, changeAddress, fee} = transaction

    const signedTxData = await util.signTransaction(
      await util.getWalletFromMasterKey(decryptedMasterKey),
      inputs,
      outputs,
      changeAddress,
    )

    assert.assert(fee.eq(signedTxData.fee), 'Transaction fee does not match')

    return Buffer.from(signedTxData.cbor_encoded_tx, 'hex').toString('base64')
  }

  async submitTransaction(signedTx: string) {
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
      isEasyConfirmationEnabled: this._isEasyConfirmationEnabled,
    }
  }
}

export class WalletClosed extends ExtendableError {}
export class SystemAuthDisabled extends ExtendableError {}
export class KeysAreInvalid extends ExtendableError {}

class WalletManager {
  _wallet: ?Wallet = null
  _id: string = ''
  _subscribers: Array<() => any> = []
  _syncErrorSubscribers: Array<(err: any) => any> = []
  _closePromise: ?Promise<any> = null
  _closeReject: ?(Error) => void = null

  _wallets = {}

  constructor() {
    this._backgroundSync()
  }

  async _listWallets() {
    const keys = await storage.keys('/wallet/')
    const result = await Promise.all(
      keys.map((key) => storage.read(`/wallet/${key}`)),
    )

    return result
  }

  async initialize() {
    const wallets = await this._listWallets()
    this._wallets = _.fromPairs(wallets.map((w) => [w.id, w]))
  }

  getWallets() {
    return this._wallets
  }

  abortWhenWalletCloses<T>(promise: Promise<T>): Promise<T> {
    assert.assert(this._closePromise, 'should have closePromise')
    /* :: if (!this._closePromise) throw 'assert' */
    return Promise.race([this._closePromise, promise])
  }

  // Note(ppershing): needs 'this' to be bound
  _notify = () => {
    // TODO(ppershing): do this in next tick?
    this._subscribers.forEach((handler) => handler())
  }

  _notifySyncError = (error: any) => {
    this._syncErrorSubscribers.forEach((handler) => handler(error))
  }

  // Note(ppershing): no need to abortWhenWalletCloses here
  async _backgroundSync() {
    try {
      if (this._wallet) {
        const wallet = this._wallet
        await wallet.tryDoFullSync()
        await this._saveState(wallet)
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

  get internalAddresses() {
    if (!this._wallet) return []
    return this._wallet.internalAddresses
  }

  get externalAddresses() {
    if (!this._wallet) return []
    return this._wallet.externalAddresses
  }

  get isEasyConfirmationEnabled() {
    if (!this._wallet) return {}
    return this._wallet._isEasyConfirmationEnabled
  }

  get confirmationCounts() {
    if (!this._wallet) return {}
    return this._wallet.confirmationCounts
  }

  get numReceiveAddresses() {
    if (!this._wallet) return 0
    return this._wallet.numReceiveAddresses
  }

  get canGenerateNewReceiveAddress() {
    if (!this._wallet) return false
    return this._wallet.canGenerateNewReceiveAddress()
  }

  get isUsedAddressIndex() {
    if (!this._wallet) return {}
    return this._wallet.isUsedAddressIndex
  }

  async generateNewUiReceiveAddressIfNeeded() {
    if (!this._wallet) return
    await this.abortWhenWalletCloses(
      this._wallet.generateNewUiReceiveAddressIfNeeded(),
    )
  }

  async generateNewUiReceiveAddress() {
    if (!this._wallet) return false
    const wallet = this._wallet

    const didGenerateNew = await this.abortWhenWalletCloses(
      wallet.generateNewUiReceiveAddress(),
    )
    if (didGenerateNew) {
      // Note: save is runaway
      this._saveState(wallet)
    }
    return didGenerateNew
  }

  async cleanupInvalidKeys() {
    if (!this._wallet) throw new WalletClosed()
    const wallet = this._wallet

    try {
      await KeyStore.deleteData(wallet._id, 'BIOMETRICS')
      await KeyStore.deleteData(wallet._id, 'SYSTEM_PIN')
    } catch (error) {
      const isDeviceSecure = await isSystemAuthSupported()
      // On android 8.0 we are able to delete keys
      // after re-enabling Lock screen
      if (
        error.code === KeyStore.REJECTIONS.KEY_NOT_DELETED &&
        !isDeviceSecure
      ) {
        throw new SystemAuthDisabled()
      } else {
        // We cannot delete keys directly on android 8.1, but it is possible
        // after we replace them
        await KeyStore.storeData(wallet._id, 'BIOMETRICS', 'DUMMY_VALUE')
        await KeyStore.storeData(wallet._id, 'SYSTEM_PIN', 'DUMMY_VALUE')

        await KeyStore.deleteData(wallet._id, 'BIOMETRICS')
        await KeyStore.deleteData(wallet._id, 'SYSTEM_PIN')
      }
    }

    await this._updateMetadata(wallet._id, {
      isEasyConfirmationEnabled: false,
    })
    wallet._isEasyConfirmationEnabled = false
  }

  async ensureKeysValidity() {
    if (!this._wallet) throw new WalletClosed()
    const wallet = this._wallet

    const canBiometricsBeUsed = await canBiometricEncryptionBeEnabled()
    const isKeyValid = await KeyStore.isKeyValid(wallet._id, 'BIOMETRICS')

    if (!isKeyValid || !canBiometricsBeUsed) {
      throw new KeysAreInvalid()
    }
  }

  async doFullSync() {
    // TODO(ppershing): this should "quit" early if we change wallet
    if (!this._wallet) return
    const wallet = this._wallet
    await this.abortWhenWalletCloses(wallet.doFullSync())
    // Note: save is runaway
    // TODO(ppershing): should we save in case wallet is closed mid-sync?
    this._saveState(wallet)
    return
  }

  async prepareTransaction(
    utxos: Array<RawUtxo>,
    address: string,
    amount: BigNumber,
  ) {
    if (!this._wallet) throw new WalletClosed()
    return await this.abortWhenWalletCloses(
      this._wallet.prepareTransaction(utxos, address, amount),
    )
  }

  async signTx(transactionData: PreparedTransactionData, decryptedKey: string) {
    if (!this._wallet) throw new WalletClosed()
    return await this.abortWhenWalletCloses(
      this._wallet.signTx(transactionData, decryptedKey),
    )
  }

  async submitTransaction(signedTx: string) {
    if (!this._wallet) throw new WalletClosed()
    return await this.abortWhenWalletCloses(
      this._wallet.submitTransaction(signedTx),
    )
  }

  async createWallet(
    name: string,
    mnemonic: string,
    password: string,
  ): Promise<Wallet> {
    // Ignore id & name for now
    const wallet = new Wallet()
    const id = await wallet._create(mnemonic, password)

    this._id = id
    this._wallets = {
      ...this._wallets,
      [id]: {id, name, isEasyConfirmationEnabled: false},
    }

    this._wallet = wallet
    await this._saveState(wallet)
    wallet.subscribe(this._notify)
    await storage.write(`/wallet/${id}`, this._wallets[id])
    this._closePromise = new Promise((resolve, reject) => {
      this._closeReject = reject
    })
    this._notify()
    return wallet
  }

  async openWallet(id: string): Promise<Wallet> {
    assert.preconditionCheck(!!id, 'openWallet:: !!id')
    const wallet = new Wallet()
    const data = await storage.read(`/wallet/${id}/data`)

    if (!data) throw new Error('Cannot read saved data')

    wallet._restore(data)
    wallet._id = id
    this._wallet = wallet
    this._id = id
    wallet.subscribe(this._notify)
    this._closePromise = new Promise((resolve, reject) => {
      this._closeReject = reject
    })
    this._notify()

    if (wallet._isEasyConfirmationEnabled) {
      await this.ensureKeysValidity()
    }

    return wallet
  }

  async save() {
    if (!this._wallet) return
    await this._saveState(this._wallet)
  }

  async _saveState(wallet: Wallet) {
    assert.assert(wallet._id, 'saveState:: wallet._id')
    /* :: if (!this._wallet) throw 'assert' */
    const data = wallet.toJSON()
    await storage.write(`/wallet/${wallet._id}/data`, data)
  }

  async listWallets() {
    const keys = await storage.keys('/wallet/')
    const result = await Promise.all(
      keys.map((key) => storage.read(`/wallet/${key}`)),
    )
    return result
  }

  async deleteEncryptedKey(encryptionMethod: EncryptionMethod) {
    if (!this._wallet) {
      throw new Error('Empty wallet')
    }

    await KeyStore.deleteData(this._id, encryptionMethod)
  }

  async disableEasyConfirmation() {
    if (!this._wallet) {
      throw new Error('Empty wallet')
    }

    await this._updateMetadata(this._wallet._id, {
      isEasyConfirmationEnabled: false,
    })

    // $FlowFixMe
    await this.deleteEncryptedKey('BIOMETRICS')
    // $FlowFixMe
    await this.deleteEncryptedKey('SYSTEM_PIN')

    // $FlowFixMe
    this._wallet._isEasyConfirmationEnabled = false
    this._notify()
  }

  async enableEasyConfirmation(masterPassword: string, intl: any) {
    if (!this._wallet) throw new WalletClosed()
    const wallet = this._wallet

    await wallet.enableEasyConfirmation(masterPassword, intl)

    await this._updateMetadata(wallet._id, {
      isEasyConfirmationEnabled: true,
    })
    await this._saveState(wallet)
    this._notify()
  }

  async changePassword(masterPassword: string, newPassword: string, intl: any) {
    if (!this._wallet) throw new WalletClosed()

    await this._wallet.changePassword(masterPassword, newPassword, intl)
  }

  canBiometricsSignInBeDisabled() {
    if (!this._wallets) {
      throw new Error('Wallet list is not initialized')
    }

    return ObjectValues(this._wallets).every(
      (wallet) => !wallet.isEasyConfirmationEnabled,
    )
  }

  closeWallet() {
    if (!this._wallet) return
    assert.assert(this._closeReject, 'close: should have _closeReject')
    /* :: if (!this._closeReject) throw 'assert' */
    // Abort all async interactions with the wallet
    const reject = this._closeReject
    this._closePromise = null
    this._closeReject = null
    this._wallet = null
    this._id = ''
    this._notify()
    // need to reject in next microtask otherwise
    // closeWallet would throw if some rejection
    // handler does not catch
    Promise.resolve().then(() => {
      reject(new WalletClosed())
    })
  }

  async removeCurrentWallet() {
    if (!this._wallet) return
    const id = this._id

    if (this.isEasyConfirmationEnabled) {
      await this.deleteEncryptedKey('BIOMETRICS')
      await this.deleteEncryptedKey('SYSTEM_PIN')
    }
    await this.deleteEncryptedKey('MASTER_PASSWORD')

    this.closeWallet()
    await storage.remove(`/wallet/${id}/data`)
    await storage.remove(`/wallet/${id}`)

    this._wallets = _.omit(this._wallets, id)
  }

  get walletName() {
    if (!this._id) return ''
    return this._wallets[this._id].name
  }

  // TODO(ppershing): how should we deal with race conditions?
  async _updateMetadata(id, newMeta) {
    assert.assert(this._wallets[id], '_updateWalletInfo id')
    const merged = {
      ...this._wallets[id],
      ...newMeta,
    }
    await storage.write(`/wallet/${id}`, merged)
    this._wallets = {
      ...this._wallets,
      [id]: merged,
    }
  }

  async rename(newName: string) {
    if (!this._id) throw new WalletClosed()
    const id = this._id

    await this._updateMetadata(id, {name: newName})

    this._notify()
  }

  async fetchUTXOs() {
    if (!this._wallet) throw new WalletClosed()
    return await this.abortWhenWalletCloses(
      api.bulkFetchUTXOsForAddresses([
        ...this.internalAddresses,
        ...this.externalAddresses,
      ]),
    )
  }
}

export default new WalletManager()
