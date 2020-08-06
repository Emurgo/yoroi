// @flow
import _ from 'lodash'
import {BigNumber} from 'bignumber.js'
import ExtendableError from 'es6-error'
import {Address} from 'react-native-chain-libs'

// import Wallet from './Wallet'
import {WalletInterface} from './WalletInterface'
import LegacyWallet from './LegacyWallet'
import ShelleyWallet from './shelley/ShelleyWallet'
import storage from '../utils/storage'
import KeyStore from './KeyStore'
import {AddressChain, AddressGenerator} from './chain'
import * as util from './byron/util'
import * as jormungandrUtil from './jormungandr/util'
import * as api from '../api/byron/api'
import {CONFIG} from '../config/config'
import {NETWORK_REGISTRY} from '../config/types'
import {isJormungandr} from '../config/networks'
import assert from '../utils/assert'
import {ObjectValues} from '../utils/flow'
import {Logger} from '../utils/logging'
import {
  canBiometricEncryptionBeEnabled,
  isSystemAuthSupported,
} from '../helpers/deviceSettings'

import type {RawUtxo, PoolInfoRequest, TxBodiesRequest} from '../api/types'
import type {
  Addressing,
  EncryptionMethod,
  PreparedTransactionData,
  V3UnsignedTxAddressedUtxoData,
} from './types'
import type {HWDeviceInfo} from './byron/ledgerUtils'
import type {PoolData} from './jormungandr/delegationUtils'
import type {NetworkId} from '../config/types'

/**
 * returns all used addresses (external and change addresses concatenated)
 * including addressing info
 * note: uses byron api by default
 */
export const mnemonicsToAddresses = async (
  mnemonic: string,
): Promise<Array<{|address: string, ...Addressing|}>> => {
  const masterKey = await util.getMasterKeyFromMnemonic(mnemonic)
  const account = await util.getAccountFromMasterKey(masterKey)
  const internalChain = new AddressChain(
    new AddressGenerator(account, 'Internal'),
  )
  const externalChain = new AddressChain(
    new AddressGenerator(account, 'External'),
  )
  const chains = [['Internal', internalChain], ['External', externalChain]]
  for (const chain of chains) {
    await chain[1].initialize()
    await chain[1].sync(api.filterUsedAddresses)
  }
  // get addresses in chunks
  const addrChunks = [
    ...internalChain.getBlocks(),
    ...externalChain.getBlocks(),
  ]
  const filteredAddresses = []
  for (let i = 0; i < addrChunks.length; i++) {
    filteredAddresses.push(...(await api.filterUsedAddresses(addrChunks[i])))
  }
  // return addresses with addressing info
  return filteredAddresses.map((addr) => {
    let change
    let index
    if (internalChain.isMyAddress(addr)) {
      change = CONFIG.NUMBERS.CHAIN_DERIVATIONS.INTERNAL
      index = internalChain.getIndexOfAddress(addr)
    } else if (externalChain.isMyAddress(addr)) {
      change = CONFIG.NUMBERS.CHAIN_DERIVATIONS.EXTERNAL
      index = externalChain.getIndexOfAddress(addr)
    } else {
      // should not happen
      throw new Error('mnemonicsToAddresses: could not find address index')
    }
    return {
      address: addr,
      addressing: {
        path: [CONFIG.NUMBERS.ACCOUNT_INDEX, change, index],
        startLevel: CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      },
    }
  })
}

// note: uses byron api by default
export const balanceForAddresses = async (
  addresses: Array<string>,
): Promise<{fundedAddresses: Array<string>, sum: BigNumber}> => {
  const {fundedAddresses, sum} = await api.bulkFetchUTXOSumForAddresses(
    addresses,
  )
  return {
    fundedAddresses,
    sum,
  }
}

export class WalletClosed extends ExtendableError {}
export class SystemAuthDisabled extends ExtendableError {}
export class KeysAreInvalid extends ExtendableError {}

class WalletManager {
  _wallet: ?WalletInterface = null
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

    Logger.debug('result::_listWallets', result)

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
  // Note(v-almonacid): if sync fails because of a chain rollback, we just wait
  // for the next sync round (tx cache should be wiped out in between)
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

  /** ========== getters =============
   * these properties are passed on to redux's State in
   * actions/history.js::mirrorTxHistory
   */

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
    return this._wallet.isEasyConfirmationEnabled
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

  get networkId() {
    if (!this._wallet) return NETWORK_REGISTRY.UNDEFINED
    return this._wallet.networkId
  }

  get isJormungandr() {
    if (!this._wallet) return false
    return isJormungandr(this._wallet.networkId)
  }

  get isHW() {
    if (!this._wallet) return false
    return this._wallet.isHW
  }

  get hwDeviceInfo() {
    if (!this._wallet) return {}
    return this._wallet.hwDeviceInfo
  }

  get version() {
    if (!this._wallet) return null
    return this._wallet.version
  }

  get walletName() {
    if (!this._id) return ''
    return this._wallets[this._id].name
  }

  // ============ security & key management ============ //

  async cleanupInvalidKeys() {
    if (!this._wallet) throw new WalletClosed()
    const wallet = this._wallet

    try {
      await KeyStore.deleteData(wallet.id, 'BIOMETRICS')
      await KeyStore.deleteData(wallet.id, 'SYSTEM_PIN')
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
        await KeyStore.storeData(wallet.id, 'BIOMETRICS', 'DUMMY_VALUE')
        await KeyStore.storeData(wallet.id, 'SYSTEM_PIN', 'DUMMY_VALUE')

        await KeyStore.deleteData(wallet.id, 'BIOMETRICS')
        await KeyStore.deleteData(wallet.id, 'SYSTEM_PIN')
      }
    }

    await this._updateMetadata(wallet.id, {
      isEasyConfirmationEnabled: false,
    })
    wallet.isEasyConfirmationEnabled = false
  }

  async ensureKeysValidity() {
    if (!this._wallet) throw new WalletClosed()
    const wallet = this._wallet

    const canBiometricsBeUsed = await canBiometricEncryptionBeEnabled()
    const isKeyValid = await KeyStore.isKeyValid(wallet.id, 'BIOMETRICS')

    if (!isKeyValid || !canBiometricsBeUsed) {
      throw new KeysAreInvalid()
    }
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

    await this._updateMetadata(this._wallet.id, {
      isEasyConfirmationEnabled: false,
    })

    await this.deleteEncryptedKey('BIOMETRICS')
    await this.deleteEncryptedKey('SYSTEM_PIN')

    // $FlowFixMe
    this._wallet.isEasyConfirmationEnabled = false
    this._notify()
  }

  async enableEasyConfirmation(masterPassword: string, intl: any) {
    if (!this._wallet) throw new WalletClosed()
    const wallet = this._wallet

    await wallet.enableEasyConfirmation(masterPassword, intl)

    await this._updateMetadata(wallet.id, {
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

  // =================== synch =================== //

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

  // ========== state/UI ============= //

  async generateNewUiReceiveAddressIfNeeded() {
    if (!this._wallet) return
    await this.abortWhenWalletCloses(
      Promise.resolve(this._wallet.generateNewUiReceiveAddressIfNeeded()),
    )
  }

  generateNewUiReceiveAddress() {
    if (!this._wallet) return false
    const wallet = this._wallet

    const didGenerateNew = wallet.generateNewUiReceiveAddress()
    if (didGenerateNew) {
      // Note: save is runaway
      this._saveState(wallet)
    }
    return didGenerateNew
  }

  // =================== persistence =================== //

  async saveWallet(
    id: string,
    name: string,
    wallet: WalletInterface,
    networkId: NetworkId,
  ) {
    this._id = id
    this._wallets = {
      ...this._wallets,
      [id]: {id, name, networkId, isEasyConfirmationEnabled: false},
    }

    this._wallet = wallet
    await this._saveState(wallet)
    wallet.subscribe(this._notify)
    await storage.write(`/wallet/${id}`, this._wallets[id])
    this._closePromise = new Promise((resolve, reject) => {
      this._closeReject = reject
    })
    this._notify()

    Logger.debug('WalletManager::saveWallet::wallet', wallet)

    return wallet
  }

  async openWallet(
    id: string,
    networkId: ?NetworkId,
  ): Promise<WalletInterface> {
    assert.preconditionCheck(!!id, 'openWallet:: !!id')
    const data = await storage.read(`/wallet/${id}/data`)
    Logger.debug('openWallet::data', data)
    if (!data) throw new Error('Cannot read saved data')

    let _networkId
    if (networkId == null) {
      if (data.isShelley === true) {
        _networkId = NETWORK_REGISTRY.JORMUNGANDR
      } else {
        _networkId = NETWORK_REGISTRY.BYRON_MAINNET
      }
    } else {
      _networkId = networkId
    }
    const wallet: WalletInterface = this._getWalletImplementation(_networkId)

    await wallet.restore(data)
    wallet.id = id
    this._wallet = wallet
    this._id = id

    wallet.subscribe(this._notify)
    this._closePromise = new Promise((resolve, reject) => {
      this._closeReject = reject
    })
    this._notify()

    if (wallet.isEasyConfirmationEnabled) {
      await this.ensureKeysValidity()
    }

    return wallet
  }

  async save() {
    if (!this._wallet) return
    await this._saveState(this._wallet)
  }

  async _saveState(wallet: WalletInterface) {
    assert.assert(wallet.id, 'saveState:: wallet.id')
    /* :: if (!this._wallet) throw 'assert' */
    const data = wallet.toJSON()
    await storage.write(`/wallet/${wallet.id}/data`, data)
  }

  async listWallets() {
    const keys = await storage.keys('/wallet/')
    const result = await Promise.all(
      keys.map((key) => storage.read(`/wallet/${key}`)),
    )
    return result
  }

  closeWallet(): Promise<void> {
    if (!this._wallet) return Promise.resolve()
    assert.assert(this._closeReject, 'close: should have _closeReject')
    /* :: if (!this._closeReject) throw 'assert' */
    // Abort all async interactions with the wallet
    // const reject = this._closeReject
    this._closePromise = null
    this._closeReject = null
    this._wallet = null
    this._id = ''
    this._notify()
    // need to reject in next microtask otherwise
    // closeWallet would throw if some rejection
    // handler does not catch
    return Promise.resolve().then(() => {
      // TODO: Check why Shelley path crash when this is active
      //  and figure out why this is actually necessary
      // reject(new WalletClosed())
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

  // =================== create =================== //

  _getWalletImplementation(networkId: NetworkId): WalletInterface {
    switch (networkId) {
      case NETWORK_REGISTRY.BYRON_MAINNET || NETWORK_REGISTRY.JORMUNGANDR:
        return new LegacyWallet()
      case NETWORK_REGISTRY.HASKELL_SHELLEY:
        return new ShelleyWallet()
      default:
        return new ShelleyWallet()
    }
  }

  async createWallet(
    name: string,
    mnemonic: string,
    password: string,
    networkId: NetworkId,
  ): Promise<WalletInterface> {
    const wallet = this._getWalletImplementation(networkId)
    const id = await wallet.create(mnemonic, password, networkId)

    return this.saveWallet(id, name, wallet, networkId)
  }

  async createWalletWithBip44Account(
    name: string,
    bip44AccountPublic: string,
    networkId: NetworkId,
    hwDeviceInfo: ?HWDeviceInfo,
  ) {
    const wallet = this._getWalletImplementation(networkId)
    const id = await wallet.createWithBip44Account(
      bip44AccountPublic,
      networkId,
      hwDeviceInfo,
    )
    Logger.debug('creating wallet...', wallet)

    return this.saveWallet(id, name, wallet, networkId)
  }

  // =================== tx building =================== //

  async getAllUtxosForKey(utxos: Array<RawUtxo>) {
    if (!this._wallet) throw new WalletClosed()
    return await this._wallet.getAllUtxosForKey(utxos)
  }

  getAddressingInfo(address: string) {
    if (!this._wallet) throw new WalletClosed()
    return this._wallet.getAddressingInfo(address)
  }

  asAddressedUtxo(utxos: Array<RawUtxo>) {
    if (!this._wallet) throw new WalletClosed()
    return this._wallet.asAddressedUtxo(utxos)
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

  async prepareDelegationTx(
    poolData: PoolData,
    valueInAccount: number,
    utxos: Array<RawUtxo>,
  ) {
    if (!this._wallet) throw new WalletClosed()
    return await this.abortWhenWalletCloses(
      this._wallet.prepareDelegationTx(poolData, valueInAccount, utxos),
    )
  }

  async signDelegationTx(
    unsignedTx: V3UnsignedTxAddressedUtxoData,
    decryptedMasterKey: string,
  ) {
    if (!this._wallet) throw new WalletClosed()
    return await this._wallet.signDelegationTx(unsignedTx, decryptedMasterKey)
  }

  // =================== backend API =================== //

  async submitTransaction(signedTx: string) {
    if (!this._wallet) throw new WalletClosed()
    return await this.abortWhenWalletCloses(
      this._wallet.submitTransaction(signedTx),
    )
  }

  async getTxsBodiesForUTXOs(request: TxBodiesRequest) {
    if (!this._wallet) throw new WalletClosed()
    return await this.abortWhenWalletCloses(
      this._wallet.getTxsBodiesForUTXOs(request),
    )
  }

  async fetchUTXOs() {
    if (!this._wallet) throw new WalletClosed()
    return await this.abortWhenWalletCloses(this._wallet.fetchUTXOs())
  }

  async fetchAccountState() {
    if (this._wallet == null) throw new WalletClosed()
    return await this.abortWhenWalletCloses(this._wallet.fetchAccountState())
  }

  async fetchPoolInfo(pool: PoolInfoRequest) {
    if (this._wallet == null) throw new WalletClosed()
    return await this._wallet.fetchPoolInfo(pool)
  }

  // =================== misc =================== //

  async checkForFlawedWallets(): Promise<boolean> {
    const mnemonics = [CONFIG.DEBUG.MNEMONIC1, CONFIG.DEBUG.MNEMONIC2]
    let affected = false
    for (const mnemonic of mnemonics) {
      Logger.debug('WalletManager::checkForFlawedWallets mnemonic:', mnemonic)
      let flawedAddresses
      if (this.isJormungandr) {
        const flawedAddressesBech32 = await jormungandrUtil.getGroupAddressesFromMnemonics(
          mnemonic,
          'External',
          [0],
        )
        flawedAddresses = await Promise.all(
          flawedAddressesBech32.map(async (addr) => {
            return Buffer.from(
              await (await Address.from_string(addr)).as_bytes(),
            ).toString('hex')
          }),
        )
      } else {
        flawedAddresses = await util.getAddressesFromMnemonics(
          mnemonic,
          'External',
          [0],
        )
      }
      if (this._wallet == null) throw new WalletClosed()
      const externalChain = this._wallet.externalChain
      Logger.debug(
        'WalletManager::checkForFlawedWallets wallet addresses [0]:',
        externalChain.addresses[0],
      )
      Logger.debug(
        'WalletManager::checkForFlawedWallets flawedAddresses [0]:',
        flawedAddresses,
      )
      if (externalChain.isMyAddress(flawedAddresses[0])) {
        Logger.debug('WalletManager::checkForFlawedWallets: address match')
        affected = true
        return affected
      }
    }
    Logger.debug('WalletManager::checkForFlawedWallets:: no match')
    return affected
  }
}

export default new WalletManager()
