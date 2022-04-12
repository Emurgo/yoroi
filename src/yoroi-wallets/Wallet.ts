/* eslint-disable @typescript-eslint/no-explicit-any */
import type {WalletChecksum} from '@emurgo/cip4-js'
import _ from 'lodash'
import type {IntlShape} from 'react-intl'
import {defaultMemoize} from 'reselect'

import * as api from '../legacy/api'
import assert from '../legacy/assert'
import {CONFIG} from '../legacy/config'
import KeyStore from '../legacy/KeyStore'
import type {HWDeviceInfo} from '../legacy/ledgerUtils'
import {Logger} from '../legacy/logging'
import {getCardanoNetworkConfigById, isJormungandr} from '../legacy/networks'
import {IsLockedError, nonblockingSynchronize, synchronize} from '../legacy/promise'
import type {EncryptionMethod} from '../legacy/types'
import {NetworkId, WalletImplementationId, YoroiProvider} from './cardano'
import {AddressChain, AddressChainJSON} from './cardano/chain'
import {TransactionCache, TransactionCacheJSON} from './cardano/shelley/transactionCache'
import {validatePassword} from './utils/validators'

type WalletState = {
  lastGeneratedAddressIndex: number
}

export type ShelleyWalletJSON = {
  version: string

  networkId: NetworkId
  walletImplementationId: WalletImplementationId
  provider?: null | YoroiProvider

  isHW: boolean
  hwDeviceInfo: null | HWDeviceInfo
  isReadOnly: boolean
  isEasyConfirmationEnabled: boolean

  publicKeyHex?: string

  lastGeneratedAddressIndex: number
  internalChain: AddressChainJSON
  externalChain: AddressChainJSON

  transactionCache: TransactionCacheJSON
}

export type ByronWalletJSON = Omit<ShelleyWalletJSON, 'account'>

export type WalletJSON = ShelleyWalletJSON | ByronWalletJSON

export class Wallet {
  id: null | string = null

  networkId: undefined | NetworkId

  walletImplementationId: undefined | WalletImplementationId

  isHW = false

  hwDeviceInfo: null | HWDeviceInfo = null

  isReadOnly: undefined | boolean

  provider: null | undefined | YoroiProvider

  isEasyConfirmationEnabled = false

  internalChain: null | AddressChain = null
  externalChain: null | AddressChain = null

  // account public key
  publicKeyHex: undefined | string

  rewardAddressHex: null | string = null

  // last known version the wallet has been opened on
  version: undefined | string

  checksum: undefined | WalletChecksum

  state: WalletState = {
    lastGeneratedAddressIndex: 0,
  }

  isInitialized = false

  transactionCache: null | TransactionCache = null

  _doFullSyncMutex: any = {name: 'doFullSyncMutex', lock: null}

  _subscriptions: Array<(Wallet) => void> = []

  _onTxHistoryUpdateSubscriptions: Array<(Wallet) => void> = []

  _isUsedAddressIndexSelector = defaultMemoize((perAddressTxs) =>
    _.mapValues(perAddressTxs, (txs) => {
      assert.assert(!!txs, 'perAddressTxs cointains false-ish value')
      return txs.length > 0
    }),
  )

  // =================== getters =================== //

  get internalAddresses() {
    if (!this.internalChain) throw new Error('invalid wallet state')

    return this.internalChain.addresses
  }

  get externalAddresses() {
    if (!this.externalChain) throw new Error('invalid wallet state')

    return this.externalChain.addresses
  }

  get isUsedAddressIndex() {
    if (!this.transactionCache) throw new Error('invalid wallet state')
    return this._isUsedAddressIndexSelector(this.transactionCache.perAddressTxs)
  }

  get numReceiveAddresses() {
    return this.state.lastGeneratedAddressIndex + 1
  }

  get transactions() {
    if (!this.transactionCache) throw new Error('invalid wallet state')
    return this.transactionCache.transactions
  }

  get confirmationCounts() {
    if (!this.transactionCache) throw new Error('invalid wallet state')
    return this.transactionCache.confirmationCounts
  }

  // ============ security & key management ============ //

  encryptAndSaveMasterKey(encryptionMethod: 'BIOMETRICS', masterKey: string): Promise<void>
  encryptAndSaveMasterKey(encryptionMethod: 'SYSTEM_PIN', masterKey: string): Promise<void>
  encryptAndSaveMasterKey(encryptionMethod: 'MASTER_PASSWORD', masterKey: string, password: string): Promise<void>
  async encryptAndSaveMasterKey(encryptionMethod: EncryptionMethod, masterKey: string, password?: string) {
    if (!this.id) throw new Error('invalid wallet state')
    if (encryptionMethod === 'MASTER_PASSWORD') {
      if (!password) throw new Error('password is required')
      await KeyStore.storeData(this.id, 'MASTER_PASSWORD', masterKey, password)
    }
    if (encryptionMethod === 'BIOMETRICS') {
      await KeyStore.storeData(this.id, encryptionMethod, masterKey)
    }
    if (encryptionMethod === 'SYSTEM_PIN') {
      await KeyStore.storeData(this.id, encryptionMethod, masterKey)
    }
  }

  async getDecryptedMasterKey(masterPassword: string, intl: IntlShape) {
    if (!this.id) throw new Error('invalid wallet state')
    return await KeyStore.getData(this.id, 'MASTER_PASSWORD', '', masterPassword, intl)
  }

  async enableEasyConfirmation(masterPassword: string, intl: IntlShape) {
    const decryptedMasterKey = await this.getDecryptedMasterKey(masterPassword, intl)

    await this.encryptAndSaveMasterKey('BIOMETRICS', decryptedMasterKey)
    await this.encryptAndSaveMasterKey('SYSTEM_PIN', decryptedMasterKey)

    this.isEasyConfirmationEnabled = true
  }

  async changePassword(masterPassword: string, newPassword: string, intl: IntlShape) {
    const isNewPasswordValid = _.isEmpty(validatePassword(newPassword, newPassword))

    if (!isNewPasswordValid) {
      throw new Error('New password is not valid')
    }

    const masterKey = await this.getDecryptedMasterKey(masterPassword, intl)

    await this.encryptAndSaveMasterKey('MASTER_PASSWORD', masterKey, newPassword)
  }

  // =================== subscriptions =================== //

  // needs to be bound
  notify = () => {
    this._subscriptions.forEach((handler) => handler(this))
  }

  subscribe(handler: (Wallet) => void) {
    this._subscriptions.push(handler)
  }

  notifyOnTxHistoryUpdate = () => {
    this._onTxHistoryUpdateSubscriptions.forEach((handler) => handler(this))
  }

  subscribeOnTxHistoryUpdate(handler: () => void) {
    this._onTxHistoryUpdateSubscriptions.push(handler)
  }

  setupSubscriptions() {
    if (!this.internalChain) throw new Error('invalid wallet state')
    if (!this.externalChain) throw new Error('invalid wallet state')
    if (!this.transactionCache) throw new Error('invalid wallet state')

    this.transactionCache.subscribe(this.notify)
    this.transactionCache.subscribeOnTxHistoryUpdate(this.notifyOnTxHistoryUpdate)
    this.internalChain.addSubscriberToNewAddresses(this.notify)
    this.externalChain.addSubscriberToNewAddresses(this.notify)
  }

  // =================== synch =================== //

  async doFullSync() {
    return await synchronize(this._doFullSyncMutex, () => this._doFullSync())
  }

  async tryDoFullSync() {
    try {
      return await nonblockingSynchronize(this._doFullSyncMutex, () => this._doFullSync())
    } catch (e) {
      if (e instanceof IsLockedError) {
        return null
      } else {
        throw e
      }
    }
  }

  isUsedAddress(address: string) {
    if (!this.transactionCache) throw new Error('invalid wallet state')
    return !!this.transactionCache.perAddressTxs[address] && this.transactionCache.perAddressTxs[address].length > 0
  }

  getLastUsedIndex(chain: AddressChain): number {
    for (let i = chain.size() - 1; i >= 0; i--) {
      if (this.isUsedAddress(chain.addresses[i])) {
        return i
      }
    }
    return -1
  }

  async _doFullSync() {
    if (!this.transactionCache) throw new Error('invalid wallet state')
    if (!this.networkId) throw new Error('invalid wallet state')
    Logger.info(`Do full sync provider =`, this.provider)
    assert.assert(this.isInitialized, 'doFullSync: isInitialized')
    // TODO: multi-network support
    const backendConfig = getCardanoNetworkConfigById(this.networkId, this.provider).BACKEND
    const filterFn = (addrs) => api.filterUsedAddresses(addrs, backendConfig)
    if (!this.internalChain) throw new Error('invalid wallet state')
    if (!this.externalChain) throw new Error('invalid wallet state')
    await Promise.all([this.internalChain.sync(filterFn), this.externalChain.sync(filterFn)])

    const addresses =
      this.rewardAddressHex != null
        ? [...this.internalChain.getBlocks(), ...this.externalChain.getBlocks(), ...[[this.rewardAddressHex]]]
        : [...this.internalChain.getBlocks(), ...this.externalChain.getBlocks()]
    if (!isJormungandr(this.networkId)) {
      Logger.info('Discovery done, now syncing transactions')
      let keepGoing = true
      while (keepGoing) {
        keepGoing = await this.transactionCache.doSyncStep(addresses, this.networkId, this.provider)
      }
    }

    // update receive screen to include any new addresses found
    const lastUsedIndex = this.getLastUsedIndex(this.externalChain)
    if (lastUsedIndex > this.state.lastGeneratedAddressIndex) {
      this.state.lastGeneratedAddressIndex = lastUsedIndex
    }
    return this.transactionCache.transactions
  }

  resync() {
    if (!this.transactionCache) throw new Error('invalid wallet state')
    this.transactionCache.resetState()
  }

  // ========== UI state ============= //

  updateState(update: Partial<WalletState>) {
    Logger.debug('Wallet::updateState', update)

    this.state = {
      ...this.state,
      ...update,
    }

    this.notify()
  }

  canGenerateNewReceiveAddress() {
    if (!this.externalChain) throw new Error('invalid wallet state')
    const lastUsedIndex = this.getLastUsedIndex(this.externalChain)
    // TODO: should use specific wallet config
    const maxIndex = lastUsedIndex + CONFIG.WALLETS.HASKELL_SHELLEY.MAX_GENERATED_UNUSED
    if (this.state.lastGeneratedAddressIndex >= maxIndex) {
      return false
    }
    return this.numReceiveAddresses < this.externalAddresses.length
  }

  generateNewUiReceiveAddressIfNeeded() {
    /* new address is automatically generated when you use the latest unused */
    if (!this.externalChain) throw new Error('invalid wallet state')
    const lastGeneratedAddress = this.externalChain.addresses[this.state.lastGeneratedAddressIndex]
    if (!this.isUsedAddress(lastGeneratedAddress)) {
      return false
    }
    return this.generateNewUiReceiveAddress()
  }

  generateNewUiReceiveAddress(): boolean {
    if (!this.canGenerateNewReceiveAddress()) return false

    this.updateState({
      lastGeneratedAddressIndex: this.state.lastGeneratedAddressIndex + 1,
    })

    return true
  }

  // ========== persistence ============= //

  // TODO: move to specific child class?
  toJSON(): WalletJSON {
    if (this.networkId == null) throw new Error('invalid WalletJSON: networkId')
    if (this.walletImplementationId == null) throw new Error('invalid WalletJSON: walletImplementationId')
    if (this.version == null) throw new Error('invalid WalletJSON: version')
    if (this.isReadOnly == null) throw new Error('invalid WalletJSON: isReadOnly')
    if (this.externalAddresses == null) throw new Error('invalid WalletJSON: externalAddresses')
    if (this.internalAddresses == null) throw new Error('invalid WalletJSON: internalAddresses')
    if (this.externalChain == null) throw new Error('invalid WalletJSON: externalChain')
    if (this.internalChain == null) throw new Error('invalid WalletJSON: internalChain')
    if (this.transactionCache == null) throw new Error('invalid WalletJSON: transactionCache')

    return {
      lastGeneratedAddressIndex: this.state.lastGeneratedAddressIndex,
      publicKeyHex: this.publicKeyHex,
      version: this.version,
      internalChain: this.internalChain.toJSON(),
      externalChain: this.externalChain.toJSON(),
      transactionCache: this.transactionCache.toJSON(),
      networkId: this.networkId,
      walletImplementationId: this.walletImplementationId,
      isHW: this.isHW,
      hwDeviceInfo: this.hwDeviceInfo,
      isReadOnly: this.isReadOnly,
      isEasyConfirmationEnabled: this.isEasyConfirmationEnabled,
      provider: this.provider,
    }
  }
}

export default Wallet
