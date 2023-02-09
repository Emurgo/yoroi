/* eslint-disable @typescript-eslint/no-explicit-any */
import ExtendableError from 'es6-error'
import uuid from 'uuid'

import {makeWalletEncryptedStorage} from '../auth'
import {Keychain} from '../auth/Keychain'
import type {HWDeviceInfo} from '../legacy/ledgerUtils'
import {Logger} from '../legacy/logging'
import type {WalletMeta} from '../legacy/state'
import {isWalletMeta, migrateWalletMetas, parseWalletMeta} from '../Storage/migrations/walletMeta'
import {isYoroiWallet, NetworkId, CardanoWallet, WalletImplementationId, YoroiWallet} from './cardano'
import {storage, YoroiStorage} from './storage'
import {WALLET_IMPLEMENTATION_REGISTRY} from './types/other'
import {parseSafe} from './utils/parsing'

export class WalletClosed extends ExtendableError {}

export type WalletManagerEvent =
  | {type: 'easy-confirmation'; enabled: boolean}
  | {type: 'hw-device-info'; hwDeviceInfo: HWDeviceInfo}

export type WalletManagerSubscription = (event: WalletManagerEvent) => void

export class WalletManager {
  private subscriptions: Array<WalletManagerSubscription> = []
  storage: YoroiStorage

  constructor() {
    this.storage = storage.join('wallet/')
  }

  async listWallets() {
    const deletedWalletIds = await this.deletedWalletIds()
    const walletIds = await this.storage.getAllKeys().then((ids) => ids.filter((id) => !deletedWalletIds.includes(id)))
    const walletMetas = await this.storage
      .multiGet(walletIds, parseWalletMeta)
      .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))
      .then((walletMetas) => walletMetas.filter(isWalletMeta)) // filter corrupted wallet metas)

    return walletMetas
  }

  // note(v-almonacid): This method retrieves all the wallets' metadata from
  // storage. Unfortunately, as new metadata is added over time (eg. networkId),
  // we need to infer some values for wallets created in older versions,
  // which may induce errors and leave us with this ugly method.
  // The responsibility to check data consistency is left to the each wallet
  // implementation.
  async initialize() {
    await this.removeDeletedWallets()
    const _storedWalletMetas = await this.listWallets()
    return migrateWalletMetas(_storedWalletMetas)
  }

  async deletedWalletIds() {
    const ids = await this.storage.getItem('deletedWalletIds', parseDeletedWalletIds)

    return ids ?? []
  }

  private async removeDeletedWallets() {
    const deletedWalletsIds = await this.deletedWalletIds()
    if (!deletedWalletsIds) return

    await Promise.all(
      deletedWalletsIds.map(async (id) => {
        const encryptedStorage = makeWalletEncryptedStorage(id)

        await this.storage.removeItem(id) // remove wallet meta
        await this.storage.removeFolder(`${id}/`) // remove wallet folder
        await encryptedStorage.rootKey.remove() // remove auth with password
        await Keychain.removeWalletKey(id) // remove auth with os
      }),
    )

    await this.storage.setItem('deletedWalletIds', [])
  }

  // Note(ppershing): needs 'this' to be bound
  _notify = (event: WalletManagerEvent) => {
    // TODO(ppershing): do this in next tick?
    this.subscriptions.forEach((handler) => handler(event))
  }

  subscribe(subscription: (event: WalletManagerEvent) => void) {
    this.subscriptions.push(subscription)

    return () => {
      this.subscriptions = this.subscriptions.filter((sub) => sub !== subscription)
    }
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

  // =================== state & persistence =================== //

  async saveWallet(
    id: string,
    name: string,
    wallet: YoroiWallet,
    networkId: NetworkId,
    walletImplementationId: WalletImplementationId,
  ) {
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
    }

    await this.storage.setItem(id, walletMeta)

    Logger.debug('WalletManager::saveWallet::wallet', wallet)

    if (isYoroiWallet(wallet)) {
      return wallet
    }

    throw new Error('invalid wallet')
  }

  async openWallet(walletMeta: WalletMeta): Promise<YoroiWallet> {
    const Wallet = this.getWalletImplementation(walletMeta.walletImplementationId)

    const wallet = await Wallet.restore({
      storage: this.storage.join(`${walletMeta.id}/`),
      walletMeta,
    })

    wallet.subscribe((event) => this._notify(event as any))
    wallet.startSync()

    return wallet
  }

  async removeWallet(id: string) {
    const deletedWalletIds = await this.deletedWalletIds()
    await this.storage.setItem('deletedWalletIds', [...deletedWalletIds, id])
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
  private getWalletImplementation(walletImplementationId: WalletImplementationId): typeof CardanoWallet {
    switch (walletImplementationId) {
      case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON:
      case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY:
      case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY_24:
        return CardanoWallet
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
    })

    return this.saveWallet(id, name, wallet, networkId, implementationId)
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

const parseDeletedWalletIds = (data: unknown) => {
  const isWalletIds = (data: unknown): data is Array<string> => {
    return !!data && Array.isArray(data) && data.every((item) => typeof item === 'string')
  }
  const parsed = parseSafe(data)

  return isWalletIds(parsed) ? parsed : undefined
}
