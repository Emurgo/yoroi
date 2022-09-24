/* eslint-disable @typescript-eslint/no-explicit-any */
import ExtendableError from 'es6-error'
import _ from 'lodash'

import {migrateWalletMetas} from '../appStorage'
import {RootKey} from '../auth/RootKey'
import assert from '../legacy/assert'
import {CONFIG, DISABLE_BACKGROUND_SYNC} from '../legacy/config'
import {ISignRequest} from '../legacy/ISignRequest'
import type {HWDeviceInfo} from '../legacy/ledgerUtils'
import {Logger} from '../legacy/logging'
import type {WalletMeta} from '../legacy/state'
import storage from '../legacy/storage'
import {
  isYoroiWallet,
  NetworkId,
  ServerStatus,
  ShelleyWallet,
  WalletImplementationId,
  WalletInterface,
  YoroiProvider,
  YoroiWallet,
} from './cardano'
import {StakePoolInfosAndHistories} from './types'
import {
  FundInfoResponse,
  NETWORK_REGISTRY,
  PoolInfoRequest,
  RawUtxo,
  TokenInfoRequest,
  TokenInfoResponse,
  TxBodiesRequest,
  WALLET_IMPLEMENTATION_REGISTRY,
} from './types/other'

export class WalletClosed extends ExtendableError {}
export class SystemAuthDisabled extends ExtendableError {}
export class KeysAreInvalid extends ExtendableError {}

export type WalletManagerEvent =
  | {type: 'easy-confirmation'; enabled: boolean}
  | {type: 'wallet-opened'; wallet: WalletInterface}
  | {type: 'wallet-closed'; id: string}
  | {type: 'hw-device-info'; hwDeviceInfo: HWDeviceInfo}

export type WalletManagerSubscription = (event: WalletManagerEvent) => void

export class WalletManager {
  _wallet: null | WalletInterface = null
  _id = ''
  private subscriptions: Array<WalletManagerSubscription> = []
  _syncErrorSubscribers: Array<(err: null | Error) => void> = []
  _serverSyncSubscribers: Array<(status: ServerStatus) => void> = []
  _onOpenSubscribers: Array<() => void> = []
  _onTxHistoryUpdateSubscribers: Array<() => void> = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _closePromise: null | Promise<any> = null
  _closeReject: null | ((error: Error) => void) = null

  _wallets = {}

  constructor() {
    // do not await on purpose
    this._backgroundSync()
  }

  async listWallets() {
    const keys = await storage.keys('/wallet/')
    const result = await Promise.all(keys.map((key) => storage.read<WalletMeta>(`/wallet/${key}`)))

    Logger.debug('result::_listWallets', result)

    return result
  }

  // note(v-almonacid): This method retrieves all the wallets' metadata from
  // storage. Unfortunately, as new metadata is added over time (eg. networkId),
  // we need to infer some values for wallets created in older versions,
  // which may induce errors and leave us with this ugly method.
  // The responsibility to check data consistency is left to the each wallet
  // implementation.
  async initialize() {
    const _storedWalletMetas = await this.listWallets()
    // need to migrate wallet list to new format after (haskell) shelley
    // integration. Prior to v3.0, w.isShelley denoted an ITN wallet
    const migratedWalletMetas = await migrateWalletMetas(_storedWalletMetas)

    this._wallets = _.fromPairs(migratedWalletMetas.map((w) => [w.id, w]))
    Logger.debug('WalletManager::initialize::wallets()', this._wallets)
  }

  getWallets() {
    return this._wallets
  }

  getWallet() {
    if (!this._wallet) {
      throw new WalletClosed()
    }

    if (!isYoroiWallet(this._wallet)) {
      throw new Error('invalid wallet')
    }

    return this._wallet
  }

  abortWhenWalletCloses<T>(promise: Promise<T>): Promise<T> {
    assert.assert(this._closePromise, 'should have closePromise')
    /* :: if (!this._closePromise) throw 'assert' */
    return Promise.race([this._closePromise, promise])
  }

  // Note(ppershing): needs 'this' to be bound
  _notify = (event: WalletManagerEvent) => {
    // TODO(ppershing): do this in next tick?
    this.subscriptions.forEach((handler) => handler(event))
  }

  _notifySyncError = (error: null | Error) => {
    this._syncErrorSubscribers.forEach((handler) => handler(error))
  }

  _notifyServerSync = (status: ServerStatus) => {
    this._serverSyncSubscribers.forEach((handler) =>
      handler({
        isServerOk: status.isServerOk,
        isMaintenance: status.isMaintenance,
        serverTime: status.serverTime || Date.now(),
      }),
    )
  }

  _notifyOnOpen = () => {
    this._onOpenSubscribers.forEach((handler) => handler())
  }

  _notifyOnTxHistoryUpdate = () => {
    this._onTxHistoryUpdateSubscribers.forEach((handler) => handler())
  }

  subscribe(subscription: (event: WalletManagerEvent) => void) {
    this.subscriptions.push(subscription)

    return () => {
      this.subscriptions = this.subscriptions.filter((sub) => sub !== subscription)
    }
  }

  subscribeBackgroundSyncError(handler: (err: null | Error) => void) {
    this._syncErrorSubscribers.push(handler)
  }

  subscribeServerSync(handler: (status: ServerStatus) => void) {
    this._serverSyncSubscribers.push(handler)
  }

  subscribeOnOpen(handler: () => void) {
    this._onOpenSubscribers.push(handler)
  }

  subscribeOnTxHistoryUpdate(handler: () => void) {
    this._onTxHistoryUpdateSubscribers.push(handler)
  }

  /** ========== getters =============
   * these properties are passed on to redux's State in
   * actions/history.js::mirrorTxHistory
   */

  get id() {
    return this.getWallet().id
  }

  get isInitialized() {
    if (!this._wallet) return false

    return this.getWallet().isInitialized
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

  get rewardAddressHex() {
    if (!this._wallet) return null
    return this._wallet.rewardAddressHex
  }

  get isEasyConfirmationEnabled() {
    if (!this._wallet) return false

    return this.getWallet().isEasyConfirmationEnabled
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

  get walletImplementationId() {
    if (!this._wallet) return ''
    return this._wallet.walletImplementationId
  }

  get isHW() {
    if (!this._wallet) return false
    return this._wallet.isHW
  }

  get isReadOnly() {
    if (!this._wallet) return false
    return this._wallet.isReadOnly
  }

  get version() {
    if (!this._wallet) return null
    return this._wallet.version
  }

  get checksum() {
    if (!this._wallet) return undefined

    return this.getWallet().checksum
  }

  get provider() {
    if (!this._wallet) return ''
    return this._wallet.provider
  }

  // ============ security & key management ============ //
  async disableEasyConfirmation() {
    const wallet = this.getWallet()

    wallet.isEasyConfirmationEnabled = false
    await this._saveState(wallet)

    await this._updateMetadata(wallet.id, {
      isEasyConfirmationEnabled: false,
    })

    this._notify({type: 'easy-confirmation', enabled: false})
  }

  async enableEasyConfirmation() {
    const wallet = this.getWallet()

    await wallet.enableEasyConfirmation()

    await this._updateMetadata(wallet.id, {
      isEasyConfirmationEnabled: true,
    })

    await this._saveState(wallet)
    this._notify({type: 'easy-confirmation', enabled: true})
  }

  // =================== synch =================== //

  // Note(ppershing): no need to abortWhenWalletCloses here
  // Note(v-almonacid): if sync fails because of a chain rollback, we just wait
  // for the next sync round (tx cache should be wiped out in between)
  async _backgroundSync() {
    try {
      if (this._wallet) {
        const wallet = this._wallet
        await wallet.tryDoFullSync()
        await this._saveState(wallet)
        const status = await wallet.checkServerStatus()
        this._notifyServerSync(status)
      }
      this._notifySyncError(null)
    } catch (e) {
      this._notifySyncError(e as Error)
    } finally {
      if (!DISABLE_BACKGROUND_SYNC && process.env.NODE_ENV !== 'test') {
        setTimeout(() => this._backgroundSync(), CONFIG.HISTORY_REFRESH_TIME)
      }
    }
  }

  async doFullSync() {
    // TODO(ppershing): this should "quit" early if we change wallet
    if (!this._wallet) return
    const wallet = this._wallet
    await this.abortWhenWalletCloses(wallet.doFullSync())
    // note: don't await on purpose
    // TODO(ppershing): should we save in case wallet is closed mid-sync?
    this._saveState(wallet)
    return
  }

  // ========== UI state ============= //

  async generateNewUiReceiveAddressIfNeeded() {
    if (!this._wallet) return
    await this.abortWhenWalletCloses(Promise.resolve(this._wallet.generateNewUiReceiveAddressIfNeeded()))
  }

  generateNewUiReceiveAddress() {
    if (!this._wallet) return false
    const wallet = this._wallet

    const didGenerateNew = wallet.generateNewUiReceiveAddress()
    if (didGenerateNew) {
      // note: don't await on purpose
      this._saveState(wallet)
    }
    return didGenerateNew
  }

  // =================== state & persistence =================== //

  async saveWallet(
    id: string,
    name: string,
    wallet: WalletInterface,
    networkId: NetworkId,
    walletImplementationId: WalletImplementationId,
    provider?: null | YoroiProvider,
  ) {
    this._id = id
    this._wallets = {
      ...this._wallets,
      [id]: {
        id,
        name,
        networkId,
        walletImplementationId,
        isHW: wallet.isHW,
        checksum: wallet.checksum,
        isEasyConfirmationEnabled: false,
        provider,
      } as WalletMeta,
    }

    await this._saveState(wallet)
    await storage.write(`/wallet/${id}`, this._wallets[id])

    Logger.debug('WalletManager::saveWallet::wallet', wallet)

    if (isYoroiWallet(wallet)) {
      return wallet
    }

    throw new Error('invalid wallet')
  }

  async openWallet(walletMeta: WalletMeta): Promise<[YoroiWallet, WalletMeta]> {
    assert.preconditionCheck(!!walletMeta.id, 'openWallet:: !!id')
    const data = await storage.read(`/wallet/${walletMeta.id}/data`)
    Logger.debug('openWallet::data', data)
    if (!data) throw new Error('Cannot read saved data')

    const wallet: WalletInterface = this._getWalletImplementation(walletMeta.walletImplementationId)
    const newWalletMeta = {...walletMeta}

    await wallet.restore(data, walletMeta)
    wallet.id = walletMeta.id
    this._wallet = wallet
    this._id = walletMeta.id

    // wallet state might have changed after restore due to migrations, so we
    // update the data in storage immediately
    await this._saveState(wallet)

    wallet.subscribe((event) => this._notify(event as any))
    wallet.subscribeOnTxHistoryUpdate(this._notifyOnTxHistoryUpdate)
    this._closePromise = new Promise((resolve, reject) => {
      this._closeReject = reject
    })
    this._notify({type: 'wallet-opened', wallet})

    this._notifyOnOpen()

    if (isYoroiWallet(wallet)) {
      return [wallet, newWalletMeta]
    }

    throw new Error('invalid wallet')
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

  closeWallet(): Promise<void> {
    if (!this._wallet) return Promise.resolve()
    Logger.debug('closing wallet...')
    assert.assert(this._closeReject, 'close: should have _closeReject')
    /* :: if (!this._closeReject) throw 'assert' */
    // Abort all async interactions with the wallet
    const reject = this._closeReject
    this._closePromise = null
    this._closeReject = null

    this._notify({type: 'wallet-closed', id: this._id})

    this._wallet = null
    this._id = ''

    // need to reject in next microtask otherwise
    // closeWallet would throw if some rejection
    // handler does not catch
    return Promise.resolve().then(() => {
      reject?.(new WalletClosed())
    })
  }

  async resyncWallet() {
    if (!this._wallet) return
    const wallet = this._wallet
    wallet.resync()
    this.save()
    await this.closeWallet()
  }

  async removeWallet(id: string) {
    await this.closeWallet()
    await storage.remove(`/wallet/${id}/data`)
    await storage.remove(`/wallet/${id}`)
    await RootKey(id).discard()

    this._wallets = _.omit(this._wallets, id)
  }

  // TODO(ppershing): how should we deal with race conditions?
  async _updateMetadata(id, newMeta) {
    assert.assert(this._wallets[id], '_updateMetadata id')
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

  async updateHWDeviceInfo(wallet: YoroiWallet, hwDeviceInfo: HWDeviceInfo) {
    wallet.hwDeviceInfo = hwDeviceInfo
    await this._saveState(wallet as unknown as WalletInterface)
  }

  // =================== create =================== //

  // returns the corresponding implementation of WalletInterface. Normally we
  // should expect that each blockchain network has 1 wallet implementation.
  // In the case of Cardano, there are two: Byron-era and Shelley-era.
  _getWalletImplementation(walletImplementationId: WalletImplementationId): WalletInterface {
    switch (walletImplementationId) {
      case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON:
      case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY:
      case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY_24:
        return new ShelleyWallet()
      // TODO
      // case WALLET_IMPLEMENTATION_REGISTRY.ERGO:
      //   return ErgoWallet()
      default:
        throw new Error('cannot retrieve wallet implementation')
    }
  }

  async createWallet(
    name: string,
    mnemonic: string,
    password: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    provider?: null | YoroiProvider,
  ) {
    const wallet = this._getWalletImplementation(implementationId)
    const id = await wallet.create(mnemonic, password, networkId, implementationId, provider)

    return this.saveWallet(id, name, wallet, networkId, implementationId, provider)
  }

  async createWalletWithBip44Account(
    name: string,
    bip44AccountPublic: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    hwDeviceInfo: null | HWDeviceInfo,
    isReadOnly: boolean,
  ) {
    const wallet = this._getWalletImplementation(implementationId)
    const id = await wallet.createWithBip44Account(
      bip44AccountPublic,
      networkId,
      implementationId,
      hwDeviceInfo,
      isReadOnly,
    )
    Logger.debug('creating wallet...', wallet)

    return this.saveWallet(id, name, wallet, networkId, implementationId)
  }

  // =================== tx building =================== //

  async getAllUtxosForKey(utxos: Array<RawUtxo>) {
    const wallet = this.getWallet()
    return wallet.getAllUtxosForKey(utxos)
  }

  getAddressingInfo(address: string) {
    const wallet = this.getWallet()
    return wallet.getAddressing(address)
  }

  asAddressedUtxo(utxos: Array<RawUtxo>) {
    const wallet = this.getWallet()
    return wallet.asAddressedUtxo(utxos)
  }

  async getDelegationStatus() {
    const wallet = this.getWallet()
    return wallet.getDelegationStatus()
  }

  async signTx<T>(signRequest: ISignRequest<T>, decryptedKey: string) {
    const wallet = this.getWallet()
    return this.abortWhenWalletCloses(wallet.signTx(signRequest as any, decryptedKey))
  }

  async signTxWithLedger(request: ISignRequest, useUSB: boolean) {
    const wallet = this.getWallet()
    return this.abortWhenWalletCloses(wallet.signTxWithLedger(request as any, useUSB))
  }

  // =================== backend API =================== //

  async submitTransaction(signedTx: string) {
    const wallet = this.getWallet()
    return this.abortWhenWalletCloses(wallet.submitTransaction(signedTx))
  }

  async getTxsBodiesForUTXOs(request: TxBodiesRequest) {
    const wallet = this.getWallet()
    return this.abortWhenWalletCloses(wallet.getTxsBodiesForUTXOs(request))
  }

  async fetchUTXOs() {
    const wallet = this.getWallet()
    return this.abortWhenWalletCloses(wallet.fetchUTXOs())
  }

  async fetchAccountState() {
    const wallet = this.getWallet()
    return this.abortWhenWalletCloses(wallet.fetchAccountState())
  }

  async fetchPoolInfo(request: PoolInfoRequest): Promise<StakePoolInfosAndHistories> {
    const wallet = this.getWallet()
    return wallet.fetchPoolInfo(request)
  }

  async fetchTokenInfo(request: TokenInfoRequest): Promise<TokenInfoResponse> {
    const wallet = this.getWallet()
    return wallet.fetchTokenInfo(request)
  }

  async fetchFundInfo(): Promise<FundInfoResponse> {
    const wallet = this.getWallet()
    return wallet.fetchFundInfo()
  }
}

export const walletManager = new WalletManager()

export default walletManager

export const mockWalletManager = {} as WalletManager
