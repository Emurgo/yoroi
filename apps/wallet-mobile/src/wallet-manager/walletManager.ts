import {parseSafe} from '@yoroi/common'
import {App, Chain} from '@yoroi/types'
import {
  BehaviorSubject,
  catchError,
  concatMap,
  finalize,
  from,
  interval,
  of,
  startWith,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs'
import uuid from 'uuid'

import {buildPortfolioTokenManagers} from '../features/Portfolio/common/hooks/usePortfolioTokenManager'
import {getCardanoWalletFactory} from '../yoroi-wallets/cardano/getWallet'
import {isYoroiWallet, YoroiWallet} from '../yoroi-wallets/cardano/types'
import {HWDeviceInfo} from '../yoroi-wallets/hw'
import {makeWalletEncryptedStorage} from '../yoroi-wallets/storage'
import {Keychain} from '../yoroi-wallets/storage/Keychain'
import {rootStorage} from '../yoroi-wallets/storage/rootStorage'
import {NetworkId, WalletImplementationId} from '../yoroi-wallets/types'
import {AddressMode, WalletInfos, WalletManagerEvent, WalletManagerSubscription, WalletMeta} from './types'
import {isWalletMeta, parseWalletMeta} from './validators'

const thirtyFiveSeconds = 35 * 1e3

export class WalletManager {
  static #instance: WalletManager
  readonly #walletsRootStorage: App.Storage = rootStorage.join('wallet/')
  readonly #rootStorage: App.Storage = rootStorage
  readonly #openedWallets: Map<YoroiWallet['id'], YoroiWallet> = new Map()
  public readonly walletInfos$ = new Subject<WalletInfos>()
  readonly #walletInfos: WalletInfos = new Map()
  readonly #tokenManagersByNetwork = buildPortfolioTokenManagers()
  readonly #isSyncing$ = new BehaviorSubject<boolean>(false)
  #selectedWalletId: YoroiWallet['id'] | null = null
  #subscriptions: Array<WalletManagerSubscription> = []
  #syncControl$ = new BehaviorSubject<boolean>(true)
  #syncSubscription: Subscription | null = null

  constructor() {
    if (WalletManager.#instance) return WalletManager.#instance
    WalletManager.#instance = this
  }

  static instance() {
    if (!WalletManager.#instance) return new WalletManager()
    return WalletManager.#instance
  }

  setSelectedWalletId(id: YoroiWallet['id']) {
    this.#selectedWalletId = id
    this._notify({type: 'selected-wallet-id', id})
  }

  getTokenManager(network: Chain.SupportedNetworks) {
    return this.#tokenManagersByNetwork[network]
  }

  get selectedWalledId() {
    return this.#selectedWalletId
  }

  startSyncingAllWallets() {
    const syncWallets = () => {
      if (this.#isSyncing$.value) return

      this.#isSyncing$.next(true)

      from(this.openWallets())
        .pipe(
          concatMap((wallets) => {
            this.#walletInfos.clear()
            wallets.forEach((wallet) => {
              this.#walletInfos.set(wallet.id, {sync: {status: 'waiting', updatedAt: Date.now()}})
              this.walletInfos$.next(new Map(this.#walletInfos))
            })
            return from(wallets)
          }),
          concatMap((wallet) => {
            this.#walletInfos.set(wallet.id, {sync: {status: 'syncing', updatedAt: Date.now()}})
            this.walletInfos$.next(new Map(this.#walletInfos))
            return from(wallet.sync({isForced: false})).pipe(
              catchError((error) => {
                this.#walletInfos.set(wallet.id, {sync: {status: 'error', error, updatedAt: Date.now()}})
                this.walletInfos$.next(new Map(this.#walletInfos))
                return of()
              }),
              finalize(() => {
                if (this.#walletInfos.get(wallet.id)?.sync.status !== 'error') {
                  this.#walletInfos.set(wallet.id, {sync: {status: 'done', updatedAt: Date.now()}})
                  this.walletInfos$.next(new Map(this.#walletInfos))
                }
              }),
            )
          }),
          finalize(() => {
            this.#isSyncing$.next(false)
          }),
        )
        .subscribe()
    }

    if (!this.#syncSubscription) {
      this.#syncSubscription = this.#syncControl$
        .pipe(
          switchMap((isActive) => (isActive ? interval(thirtyFiveSeconds).pipe(startWith(0)) : of())),
          concatMap(() => of(syncWallets())),
        )
        .subscribe()
    }

    return {
      destroy: () => {
        this.#syncSubscription?.unsubscribe()
        this.#syncSubscription = null
      },
    }
  }

  get syncing$() {
    return this.#isSyncing$.asObservable()
  }

  get isSyncing() {
    return this.#isSyncing$.value
  }

  get syncActive$() {
    return this.#syncControl$.asObservable()
  }

  get isSyncActive() {
    return this.#syncControl$.value
  }

  pauseSyncing() {
    this.#syncControl$.next(false)
  }

  resumeSyncing() {
    this.#syncControl$.next(true)
  }

  getOpenedWalletsByNetwork = () => {
    const openedWalletsByNetwork = new Map<Chain.SupportedNetworks, Set<YoroiWallet['id']>>()

    this.#openedWallets.forEach(({id, network}) => {
      if (!openedWalletsByNetwork.has(network)) openedWalletsByNetwork.set(network, new Set())

      openedWalletsByNetwork.get(network)?.add(id)
    })

    return openedWalletsByNetwork
  }

  getOpenedWalletById = (id: YoroiWallet['id']) => {
    return this.#openedWallets.get(id)
  }

  async openWallets() {
    const walletMetas = await this.listWallets()
    const closedWallets = walletMetas.filter((meta) => !this.#openedWallets.has(meta.id))
    const wallets = await Promise.all(closedWallets.map((meta) => this.openWallet(meta)))
    wallets.forEach((wallet) => this.#openedWallets.set(wallet.id, wallet))
    return [...this.#openedWallets.values()]
  }

  async listWallets() {
    const deletedWalletIds = await this.deletedWalletIds()
    const walletIds = await this.#walletsRootStorage
      .getAllKeys()
      .then((ids) => ids.filter((id) => !deletedWalletIds.includes(id)))
    const walletMetas = await this.#walletsRootStorage
      .multiGet(walletIds, parseWalletMeta)
      .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))
      .then((walletMetas) => walletMetas.filter(isWalletMeta)) // filter corrupted wallet metas)

    return walletMetas
  }

  async deletedWalletIds() {
    const ids = await this.#rootStorage.getItem('deletedWalletIds', parseDeletedWalletIds)

    return ids ?? []
  }

  async removeDeletedWallets() {
    const deletedWalletsIds = await this.deletedWalletIds()
    if (!deletedWalletsIds) return

    await Promise.all(
      deletedWalletsIds.map(async (id) => {
        const encryptedStorage = makeWalletEncryptedStorage(id)

        await this.#walletsRootStorage.removeItem(id) // remove wallet meta
        await this.#walletsRootStorage.removeFolder(`${id}/`) // remove wallet folder
        await encryptedStorage.rootKey.remove() // remove auth with password
        await Keychain.removeWalletKey(id) // remove auth with os
      }),
    )

    await this.#rootStorage.setItem('deletedWalletIds', [])
  }

  _notify = (event: WalletManagerEvent) => {
    this.#subscriptions.forEach((handler) => handler(event))
  }

  subscribe(subscription: (event: WalletManagerEvent) => void) {
    this.#subscriptions.push(subscription)

    return () => {
      this.#subscriptions = this.#subscriptions.filter((sub) => sub !== subscription)
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
    addressMode: AddressMode,
  ) {
    if (!isYoroiWallet(wallet)) throw new Error('invalid wallet')

    const walletMeta: WalletMeta = {
      id,
      name,
      networkId,
      walletImplementationId,
      addressMode,
      isHW: wallet.isHW,
      checksum: wallet.checksum,
      isEasyConfirmationEnabled: false,
    }

    await wallet.save()
    await this.#walletsRootStorage.setItem(id, walletMeta)

    return wallet
  }

  async openWallet(walletMeta: WalletMeta): Promise<YoroiWallet> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.#openedWallets.has(walletMeta.id)) return this.#openedWallets.get(walletMeta.id)!

    const {id, walletImplementationId, networkId} = walletMeta
    const walletFactory = getWalletFactory({networkId, implementationId: walletImplementationId})

    const wallet = await walletFactory.restore({
      storage: this.#walletsRootStorage.join(`${id}/`),
      walletMeta,
    })

    wallet.subscribe((event) => this._notify(event as never))

    return wallet
  }

  async removeWallet(id: string) {
    const deletedWalletIds = await this.deletedWalletIds()
    this.#openedWallets.delete(id)
    await this.#rootStorage.setItem('deletedWalletIds', [...deletedWalletIds, id])
  }

  // TODO(ppershing): how should we deal with race conditions?
  async _updateMetadata(id: string, newMeta: {isEasyConfirmationEnabled: boolean}) {
    const walletMeta = await this.#walletsRootStorage.getItem(id, parseWalletMeta)
    const merged = {...walletMeta, ...newMeta}
    return this.#walletsRootStorage.setItem(id, merged)
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
    const storage = this.#walletsRootStorage.join(`${id}/`)

    const wallet = await walletFactory.create({
      storage,
      id,
      mnemonic,
      password,
    })

    return this.saveWallet(id, name, wallet, networkId, implementationId, addressMode)
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
    const storage = this.#walletsRootStorage.join(`${id}/`)

    const wallet = await walletFactory.createBip44({
      storage,
      id,
      accountPubKeyHex,
      hwDeviceInfo,
      isReadOnly,
    })

    return this.saveWallet(id, name, wallet, networkId, implementationId, addressMode)
  }
}

export const walletManager = WalletManager.instance()

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
