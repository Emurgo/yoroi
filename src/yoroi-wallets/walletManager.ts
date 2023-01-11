/* eslint-disable @typescript-eslint/no-explicit-any */
import ExtendableError from 'es6-error'
import _ from 'lodash'
import uuid from 'uuid'

import {EncryptedStorage, EncryptedStorageKeys} from '../auth'
import {Keychain} from '../auth/Keychain'
import assert from '../legacy/assert'
import {CONFIG, DISABLE_BACKGROUND_SYNC} from '../legacy/config'
import type {HWDeviceInfo} from '../legacy/ledgerUtils'
import {Logger} from '../legacy/logging'
import type {WalletMeta} from '../legacy/state'
import {isWalletMeta, migrateWalletMetas, parseWalletMeta} from '../Storage/migrations/walletMeta'
import {isYoroiWallet, NetworkId, ShelleyWallet, WalletImplementationId, YoroiProvider, YoroiWallet} from './cardano'
import {Storage, storage} from './storage'
import {WALLET_IMPLEMENTATION_REGISTRY} from './types/other'

export class WalletClosed extends ExtendableError {}

export type WalletManagerEvent =
  | {type: 'easy-confirmation'; enabled: boolean}
  | {type: 'wallet-opened'; wallet: YoroiWallet}
  | {type: 'wallet-closed'; id: string}
  | {type: 'hw-device-info'; hwDeviceInfo: HWDeviceInfo}

export type WalletManagerSubscription = (event: WalletManagerEvent) => void

export class WalletManager {
  _wallet: null | YoroiWallet = null
  _id = ''
  private subscriptions: Array<WalletManagerSubscription> = []
  _onOpenSubscribers: Array<() => void> = []
  _onTxHistoryUpdateSubscribers: Array<() => void> = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _closePromise: null | Promise<any> = null
  _closeReject: null | ((error: Error) => void) = null
  storage: Storage

  constructor() {
    // do not await on purpose
    this._backgroundSync()
    this.storage = storage.join('wallet/')
  }

  async listWallets() {
    const keys = await this.storage.getAllKeys()
    const result = await this.storage.multiGet(keys, parseWalletMeta)

    Logger.debug('result::_listWallets', result)

    return result.map(([_, walletMeta]) => walletMeta).filter(isWalletMeta) // filter corrupted wallet metas
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
        await this._wallet.tryDoFullSync()
        await this._wallet.save()
      }
    } catch (error) {
      Logger.error((error as Error)?.message)
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
    wallet: YoroiWallet,
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

    await this.storage.setItem(id, walletMeta)

    Logger.debug('WalletManager::saveWallet::wallet', wallet)

    if (isYoroiWallet(wallet)) {
      return wallet
    }

    throw new Error('invalid wallet')
  }

  async openWallet(walletMeta: WalletMeta): Promise<YoroiWallet> {
    await this.closeWallet()
    assert.preconditionCheck(!!walletMeta.id, 'openWallet:: !!id')

    const Wallet = this.getWalletImplementation(walletMeta.walletImplementationId)

    const wallet = await Wallet.restore({
      storage: this.storage.join(`${walletMeta.id}/`),
      walletMeta,
    })

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

    return wallet
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

    await this.storage.removeItem(`${id}/data`) // remove wallet data
    await EncryptedStorage.remove(EncryptedStorageKeys.rootKey(id)) // remove auth with password
    await Keychain.removeWalletKey(id) // remove auth with os
    await this.storage.removeItem(id) // remove wallet meta
  }

  // TODO(ppershing): how should we deal with race conditions?
  async _updateMetadata(id, newMeta) {
    const walletMeta = await this.storage.getItem(id, parseWalletMeta)
    const merged = {...walletMeta, ...newMeta}
    return this.storage.setItem(id, merged)
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
    provider: YoroiProvider | undefined,
  ) {
    const Wallet = this.getWalletImplementation(implementationId)
    const id = uuid.v4()

    const wallet = await Wallet.create({
      storage: this.storage.join(`${id}/`),
      networkId,
      id,
      mnemonic,
      password,
      implementationId,
      provider,
    })

    return this.saveWallet(id, name, wallet, networkId, implementationId, provider)
  }

  async createWalletWithBip44Account(
    name: string,
    accountPubKeyHex: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    hwDeviceInfo: null | HWDeviceInfo,
    isReadOnly: boolean,
  ) {
    const Wallet = this.getWalletImplementation(implementationId)
    const id = uuid.v4()

    const wallet = await Wallet.createBip44({
      storage: this.storage.join(`${id}/`),
      networkId,
      id,
      accountPubKeyHex,
      implementationId,
      hwDeviceInfo,
      isReadOnly,
    })

    Logger.debug('creating wallet...', wallet)

    return this.saveWallet(id, name, wallet, networkId, implementationId)
  }
}

export const walletManager = new WalletManager()

export default walletManager

export const mockWalletManager = {} as WalletManager
