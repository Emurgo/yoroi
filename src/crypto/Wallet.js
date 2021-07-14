// @flow

// TODO(v-almonacid): transactionCache should be decoupled from this class.
// Use an interface instead

import _ from 'lodash'
import {defaultMemoize} from 'reselect'
import {type IntlShape} from 'react-intl'

import KeyStore from './KeyStore'
import {AddressChain} from './shelley/chain'
import * as api from '../api/shelley/api'
import {CONFIG} from '../config/config'
import {isJormungandr, getCardanoNetworkConfigById} from '../config/networks'
import assert from '../utils/assert'
import {Logger} from '../utils/logging'
import {synchronize, nonblockingSynchronize, IsLockedError} from '../utils/promise'
import {TransactionCache} from './shelley/transactionCache'
import {validatePassword} from '../utils/validators'

import type {EncryptionMethod} from './types'
import type {Mutex} from '../utils/promise'
import type {HWDeviceInfo} from './shelley/ledgerUtils'
import type {NetworkId, WalletImplementationId} from '../config/types'
import type {WalletChecksum} from '@emurgo/cip4-js'

type WalletState = {|
  lastGeneratedAddressIndex: number,
|}

export default class Wallet {
  // $FlowFixMe null
  id: string = null

  networkId: NetworkId

  walletImplementationId: WalletImplementationId

  isHW: boolean = false

  hwDeviceInfo: ?HWDeviceInfo

  isReadOnly: boolean

  isEasyConfirmationEnabled: boolean = false

  // $FlowFixMe null
  internalChain: AddressChain = null
  // $FlowFixMe null
  externalChain: AddressChain = null

  // account public key
  publicKeyHex: string

  rewardAddressHex: ?string = null

  // last known version the wallet has been opened on
  version: ?string

  checksum: WalletChecksum

  state: WalletState = {
    lastGeneratedAddressIndex: 0,
  }

  isInitialized: boolean = false

  // $FlowFixMe null
  transactionCache: TransactionCache = null

  _doFullSyncMutex: Mutex = {name: 'doFullSyncMutex', lock: null}

  _subscriptions: Array<(Wallet) => any> = []

  _onTxHistoryUpdateSubscriptions: Array<(Wallet) => any> = []

  _isUsedAddressIndexSelector = defaultMemoize((perAddressTxs) =>
    _.mapValues(perAddressTxs, (txs) => {
      assert.assert(!!txs, 'perAddressTxs cointains false-ish value')
      return txs.length > 0
    }),
  )

  // =================== getters =================== //

  get internalAddresses() {
    return this.internalChain.addresses
  }

  get externalAddresses() {
    return this.externalChain.addresses
  }

  get isUsedAddressIndex() {
    return this._isUsedAddressIndexSelector(this.transactionCache.perAddressTxs)
  }

  get numReceiveAddresses() {
    return this.state.lastGeneratedAddressIndex + 1
  }

  get transactions() {
    return this.transactionCache.transactions
  }

  get confirmationCounts() {
    return this.transactionCache.confirmationCounts
  }

  // ============ security & key management ============ //

  async encryptAndSaveMasterKey(encryptionMethod: EncryptionMethod, masterKey: string, password?: string) {
    await KeyStore.storeData(this.id, encryptionMethod, masterKey, password)
  }

  async getDecryptedMasterKey(masterPassword: string, intl: IntlShape) {
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

  subscribe(handler: (Wallet) => any) {
    this._subscriptions.push(handler)
  }

  notifyOnTxHistoryUpdate = () => {
    this._onTxHistoryUpdateSubscriptions.forEach((handler) => handler(this))
  }

  subscribeOnTxHistoryUpdate(handler: () => any) {
    this._onTxHistoryUpdateSubscriptions.push(handler)
  }

  setupSubscriptions() {
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
    Logger.info('Do full sync')
    assert.assert(this.isInitialized, 'doFullSync: isInitialized')
    // TODO: multi-network support
    const backendConfig = getCardanoNetworkConfigById(this.networkId).BACKEND
    const filterFn = (addrs) => api.filterUsedAddresses(addrs, backendConfig)
    await Promise.all([this.internalChain.sync(filterFn), this.externalChain.sync(filterFn)])
    // prettier-ignore
    const addresses =
      this.rewardAddressHex != null
        ? [
          ...this.internalChain.getBlocks(),
          ...this.externalChain.getBlocks(),
          ...[[this.rewardAddressHex]],
        ]
        : [...this.internalChain.getBlocks(), ...this.externalChain.getBlocks()]
    if (!isJormungandr(this.networkId)) {
      Logger.info('Discovery done, now syncing transactions')
      let keepGoing = true
      while (keepGoing) {
        keepGoing = await this.transactionCache.doSyncStep(
          // $FlowFixMe undefined or null is incompatible with string
          addresses,
          this.networkId,
        )
      }
    }

    // update receive screen to include any new addresses found
    const lastUsedIndex = this.getLastUsedIndex(this.externalChain)
    if (lastUsedIndex > this.state.lastGeneratedAddressIndex) {
      this.state.lastGeneratedAddressIndex = lastUsedIndex
    }
    return this.transactionCache.transactions
  }

  // ========== UI state ============= //

  /* global $Shape */
  updateState(update: $Shape<WalletState>) {
    Logger.debug('Wallet::updateState', update)

    this.state = {
      ...this.state,
      ...update,
    }

    this.notify()
  }

  canGenerateNewReceiveAddress() {
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
  toJSON() {
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
    }
  }
}
