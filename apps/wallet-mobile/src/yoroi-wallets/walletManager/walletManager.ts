/* eslint-disable @typescript-eslint/no-explicit-any */
import {parseSafe} from '@yoroi/common'
import {App} from '@yoroi/types'
import ExtendableError from 'es6-error'
import uuid from 'uuid'

import {saveAddressMode} from '../../features/Receive/common/storage'
import {getCardanoWalletFactory} from '../cardano/getWallet'
import {CardanoTypes, isYoroiWallet, YoroiWallet} from '../cardano/types'
import {HWDeviceInfo} from '../hw'
import {Logger} from '../logging'
import {isWalletMeta, migrateWalletMetas, parseWalletMeta} from '../migrations/walletMeta'
import {makeWalletEncryptedStorage} from '../storage'
import {Keychain} from '../storage/Keychain'
import {rootStorage} from '../storage/rootStorage'
import {AddressMode, NetworkId, WalletImplementationId} from '../types'

export class WalletClosed extends ExtendableError {}

export type WalletMeta = {
  id: string
  name: string
  networkId: NetworkId
  walletImplementationId: WalletImplementationId
  isHW: boolean
  isShelley?: boolean | null | undefined
  // legacy jormungandr
  isEasyConfirmationEnabled: boolean
  checksum: CardanoTypes.WalletChecksum
}

export type WalletManagerEvent =
  | {type: 'easy-confirmation'; enabled: boolean}
  | {type: 'hw-device-info'; hwDeviceInfo: HWDeviceInfo}

export type WalletManagerSubscription = (event: WalletManagerEvent) => void

export class WalletManager {
  private subscriptions: Array<WalletManagerSubscription> = []
  storage: App.Storage

  constructor() {
    this.storage = rootStorage.join('wallet/')
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
    const {id, walletImplementationId, networkId} = walletMeta
    const walletFactory = getWalletFactory({networkId, implementationId: walletImplementationId})

    const wallet = await walletFactory.restore({
      storage: this.storage.join(`${id}/`),
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
  async _updateMetadata(id: string, newMeta: {isEasyConfirmationEnabled: boolean}) {
    const walletMeta = await this.storage.getItem(id, parseWalletMeta)
    const merged = {...walletMeta, ...newMeta}
    return this.storage.setItem(id, merged)
  }

  async updateHWDeviceInfo(wallet: YoroiWallet, hwDeviceInfo: HWDeviceInfo) {
    wallet.hwDeviceInfo = hwDeviceInfo
    await wallet.save()
  }

  // =================== create =================== //
  async createWallet(
    name: string,
    mnemonic: string,
    password: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    addressMode: AddressMode,
  ) {
    const walletFactory = getWalletFactory({networkId, implementationId})
    const id = uuid.v4()
    const storage = this.storage.join(`${id}/`)

    const wallet = await walletFactory.create({
      storage,
      id,
      mnemonic,
      password,
    })

    // created new wallets default to single address mode
    await saveAddressMode(storage)(addressMode)

    return this.saveWallet(id, name, wallet, networkId, implementationId)
  }

  async createWalletWithBip44Account(
    name: string,
    accountPubKeyHex: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    hwDeviceInfo: null | HWDeviceInfo,
    isReadOnly: boolean,
    addressMode: AddressMode,
  ) {
    const walletFactory = getWalletFactory({networkId, implementationId})
    const id = uuid.v4()
    const storage = this.storage.join(`${id}/`)

    const wallet = await walletFactory.createBip44({
      storage,
      id,
      accountPubKeyHex,
      hwDeviceInfo,
      isReadOnly,
    })

    // created new wallets default to single address mode
    await saveAddressMode(storage)(addressMode)

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

const getWalletFactory = ({networkId, implementationId}: {networkId: number; implementationId: string}) => {
  const walletFactory = getCardanoWalletFactory({networkId, implementationId})

  if (!walletFactory) {
    throw new Error('invalid wallet')
  }

  return walletFactory
}
