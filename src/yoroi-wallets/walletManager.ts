/* eslint-disable @typescript-eslint/no-explicit-any */
import ExtendableError from 'es6-error'
import _ from 'lodash'
import uuid from 'uuid'

import {migrateWalletMetas} from '../appStorage'
import {EncryptedStorage, EncryptedStorageKeys} from '../auth'
import {Keychain} from '../auth/Keychain'
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
import {WALLET_IMPLEMENTATION_REGISTRY} from './types/other'
import {WalletJSON} from './Wallet'

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
    return migrateWalletMetas(_storedWalletMetas)
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

  // ============ security & key management ============ //
  async disableEasyConfirmation(wallet: YoroiWallet) {
    await wallet.disableEasyConfirmation()
    await wallet.save()

    await this._updateMetadata(wallet.id, {
      isEasyConfirmationEnabled: false,
    })

    this._notify({type: 'easy-confirmation', enabled: false})
  }

  async enableEasyConfirmation(wallet: YoroiWallet, password: string) {
    const rootKey = await wallet.encryptedStorage.rootKey.read(password)
    await wallet.enableEasyConfirmation(rootKey)
    await wallet.save()

    await this._updateMetadata(wallet.id, {
      isEasyConfirmationEnabled: true,
    })

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
        await wallet.save()
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

    await wallet.save()
    if (!wallet.checksum) throw new Error('invalid wallet')
    const walletMeta: WalletMeta = {
      id,
      name,
      networkId,
      walletImplementationId,
      isHW: wallet.isHW,
      checksum: wallet.checksum,
      isEasyConfirmationEnabled: false,
      provider,
    }
    await storage.write(`/wallet/${id}`, walletMeta)

    Logger.debug('WalletManager::saveWallet::wallet', wallet)

    if (isYoroiWallet(wallet)) {
      return wallet
    }

    throw new Error('invalid wallet')
  }

  async openWallet(walletMeta: WalletMeta): Promise<[YoroiWallet, WalletMeta]> {
    await this.closeWallet()
    assert.preconditionCheck(!!walletMeta.id, 'openWallet:: !!id')
    const data = await storage.read<WalletJSON>(`/wallet/${walletMeta.id}/data`)
    Logger.debug('openWallet::data', data)
    if (!data) throw new Error('Cannot read saved data')

    const newWalletMeta = {...walletMeta}

    // can be null for versions < 3.0.0
    const networkId = data.networkId ?? walletMeta.networkId

    const Wallet = this.getWalletImplementation(walletMeta.walletImplementationId)
    const wallet = new Wallet(storage, networkId, newWalletMeta.id)

    await wallet.restore(data, walletMeta)
    if (!isYoroiWallet(wallet)) throw new Error('invalid wallet')

    this._wallet = wallet
    this._id = walletMeta.id

    // wallet state might have changed after restore due to migrations, so we
    // update the data in storage immediately
    await wallet.save()

    wallet.subscribe((event) => this._notify(event as any))
    wallet.subscribeOnTxHistoryUpdate(this._notifyOnTxHistoryUpdate)
    this._closePromise = new Promise((resolve, reject) => {
      this._closeReject = reject
    })
    this._notify({type: 'wallet-opened', wallet})

    this._notifyOnOpen()

    return [wallet, newWalletMeta]
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

  // wallet pending promises can still write to the storage (requires a semaphore)
  async removeWallet(id: string) {
    if (!this._wallet) throw new Error('invalid state')

    // wallet.remove
    await this._wallet.clear()

    // legacy
    await this.closeWallet()

    // wallet.remove
    await storage.remove(`/wallet/${id}/data`)
    await EncryptedStorage.remove(EncryptedStorageKeys.rootKey(id))
    await Keychain.removeWalletKey(id)

    await storage.remove(`/wallet/${id}`)
  }

  // TODO(ppershing): how should we deal with race conditions?
  async _updateMetadata(id, newMeta) {
    const walletMeta = await storage.read<WalletMeta>(`/wallet/${id}`)
    const merged = {...walletMeta, ...newMeta}
    return storage.write(`/wallet/${id}`, merged)
  }

  async updateHWDeviceInfo(wallet: YoroiWallet, hwDeviceInfo: HWDeviceInfo) {
    wallet.hwDeviceInfo = hwDeviceInfo
    await wallet.save()
  }

  // =================== create =================== //

  // returns the corresponding implementation of WalletInterface. Normally we
  // should expect that each blockchain network has 1 wallet implementation.
  // In the case of Cardano, there are two: Byron-era and Shelley-era.
  private getWalletImplementation(walletImplementationId: WalletImplementationId): typeof ShelleyWallet {
    switch (walletImplementationId) {
      case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON:
      case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY:
      case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY_24:
        return ShelleyWallet
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
    const Wallet = this.getWalletImplementation(implementationId)
    const id = uuid.v4()
    const wallet = new Wallet(storage, networkId, id)
    await wallet.create(mnemonic, password, networkId, implementationId, provider)

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
    const Wallet = this.getWalletImplementation(implementationId)
    const id = uuid.v4()
    const wallet = new Wallet(storage, networkId, id)
    await wallet.createWithBip44Account(bip44AccountPublic, networkId, implementationId, hwDeviceInfo, isReadOnly)

    Logger.debug('creating wallet...', wallet)

    return this.saveWallet(id, name, wallet, networkId, implementationId)
  }

  // =================== tx building =================== //

  getAddressingInfo(address: string) {
    const wallet = this.getWallet()
    return wallet.getAddressing(address)
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
}

export const walletManager = new WalletManager()

export default walletManager

export const mockWalletManager = {} as WalletManager
