import {difference, parseSafe} from '@yoroi/common'
import {Blockies} from '@yoroi/identicon'
import {App, Chain, HW, Network, Wallet} from '@yoroi/types'
import {freeze} from 'immer'
import {
  BehaviorSubject,
  catchError,
  concatMap,
  finalize,
  from,
  interval,
  of,
  startWith,
  Subscription,
  switchMap,
} from 'rxjs'
import uuid from 'uuid'

import {time} from '../../kernel/constants'
import {logger} from '../../kernel/logger/logger'
import {makeWalletEncryptedStorage} from '../../kernel/storage/EncryptedStorage'
import {KeychainManager} from '../../kernel/storage/Keychain'
import {WalletEvent, YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {wrappedCsl} from '../../yoroi-wallets/cardano/wrappedCsl'
import {isWalletMeta, parseWalletMeta} from './common/constants'
import {
  SyncWalletInfo,
  SyncWalletInfos,
  WalletManagerEvent,
  WalletManagerOptions,
  WalletManagerSubscription,
} from './common/types'
import {getWalletFactory} from './network-manager/helpers/get-wallet-factory'

export class WalletManager {
  // keep it in sync with storage version
  static readonly version = 3
  readonly #wallets: Map<YoroiWallet['id'], YoroiWallet> = new Map()
  readonly #walletMetas$ = new BehaviorSubject<Map<YoroiWallet['id'], Wallet.Meta>>(new Map())
  readonly #syncWalletInfos$ = new BehaviorSubject<SyncWalletInfos>(freeze(new Map()))
  readonly #selectedWalletId$ = new BehaviorSubject<YoroiWallet['id'] | null>(null)
  readonly #selectedNetwork$ = new BehaviorSubject<Chain.SupportedNetworks>(Chain.Network.Mainnet)
  readonly #isSyncing$ = new BehaviorSubject<boolean>(false)
  readonly #syncControl$ = new BehaviorSubject<boolean>(true)

  #syncSubscription: Subscription | null = null
  #syncInterval = time.seconds(35)

  // injected (constructor)
  readonly #keychainManager?: KeychainManager
  readonly #rootStorage: App.Storage
  readonly #networkManagers: Readonly<Record<Chain.SupportedNetworks, Network.Manager>>

  // @deprecated legacy to be replaced by networkManager.rootStorage
  readonly #walletsRootStorage: App.Storage

  // @deprecated should consume one of the streams
  #subscriptions: Array<WalletManagerSubscription> = []

  constructor({keychainManager, rootStorage, networkManagers}: WalletManagerOptions) {
    this.#networkManagers = networkManagers
    this.#keychainManager = keychainManager
    this.#rootStorage = rootStorage

    this.#walletsRootStorage = rootStorage.join('wallet/')
  }

  setSelectedWalletId(id: YoroiWallet['id']) {
    logger.debug('WalletManager: setSelectedWalletId new wallet selected', {id})
    this.#selectedWalletId$.next(id)
  }

  /**
   * It updates the wallet meta and persists it to the storage
   * **ATENTION** it expects the wallet meta to be already loaded
   * otherwise it will throw an error
   *
   * @param {WalletMeta['id']} id
   * @param {Partial<Pick<WalletMeta, 'addressMode' | 'isEasyConfirmationEnabled' | 'name'>} meta
   * @throws {Error} if the wallet meta is not loaded/found
   */
  private updateMeta(
    id: Wallet.Meta['id'],
    meta: Partial<Pick<Wallet.Meta, 'addressMode' | 'isEasyConfirmationEnabled' | 'name'>>,
  ) {
    const walletMeta = this.#walletMetas$.value.get(id)
    if (!walletMeta) {
      const error = new Error('WalletManager: updateMeta meta not found')
      logger.error(error, {id})
      throw error
    }

    // optmistic update
    const newMeta: Wallet.Meta = {...walletMeta, ...meta}
    const newMetas = new Map(this.#walletMetas$.value)
    newMetas.set(id, newMeta)
    this.#walletMetas$.next(freeze(newMetas))
    logger.info('WalletManager: update meta', {from: walletMeta, to: newMeta})

    this.#walletsRootStorage.setItem(id, newMeta).catch((error) => {
      logger.error(error, {id})
    })
  }

  get selectedWalledId() {
    return this.#selectedWalletId$.value
  }

  get selectedWalletId$() {
    return this.#selectedWalletId$.asObservable()
  }

  setSelectedNetwork(network: Chain.SupportedNetworks) {
    this.#selectedNetwork$.next(network)
  }

  get selectedNetwork() {
    return this.#selectedNetwork$.value
  }

  get selectedNetwork$() {
    return this.#selectedNetwork$.asObservable()
  }

  get walletMetas$() {
    return this.#walletMetas$.asObservable()
  }

  get hasWallets() {
    // always based on metas
    return this.#walletMetas$.value.size > 0
  }

  get walletMetas() {
    return this.#walletMetas$.value
  }

  get selectedNetworkManager() {
    return this.#networkManagers[this.selectedNetwork]
  }

  getNetworkManager(network: Chain.SupportedNetworks) {
    return this.#networkManagers[network]
  }

  getWalletsByNetwork = () => {
    const openedWalletsByNetwork = new Map<Chain.SupportedNetworks, Set<YoroiWallet['id']>>()

    this.#wallets.forEach(({id, networkManager: {network}}) => {
      if (!openedWalletsByNetwork.has(network)) openedWalletsByNetwork.set(network, new Set())

      openedWalletsByNetwork.get(network)?.add(id)
    })

    return openedWalletsByNetwork
  }

  getWalletById = (id: YoroiWallet['id']) => {
    return this.#wallets.get(id)
  }

  getWalletMetaById = (id: YoroiWallet['id']) => {
    return this.#walletMetas$.value.get(id)
  }

  getTokenManager(network: Chain.SupportedNetworks) {
    return this.#networkManagers[network].tokenManager
  }

  get syncWalletInfos$() {
    return this.#syncWalletInfos$.asObservable()
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
    logger.debug('WalletManager: pauseSyncing requested')
    this.#syncControl$.next(false)
  }

  resumeSyncing() {
    logger.debug('WalletManager: resumeSyncing requested')
    this.#syncControl$.next(true)
  }

  private resetSyncWalletInfos(wallets: ReadonlyArray<YoroiWallet>) {
    const infos = new Map(this.#syncWalletInfos$.value)
    for (const wallet of wallets) {
      const syncWalletInfo: SyncWalletInfo = {status: 'waiting', updatedAt: Date.now(), id: wallet.id}
      infos.set(wallet.id, syncWalletInfo)
    }

    // drop wallets that are not returned by the list (deleted wallets)
    // can't delete on removeWallet cuz a wallet can be marked to be deleted while it's syncing
    difference(
      wallets.map(({id}) => id),
      Array.from(infos.keys()),
    ).forEach((id) => {
      logger.debug('WalletManager: resetSyncWalletInfos deleting wallet from sync list', {id})
      infos.delete(id)
    })

    this.#syncWalletInfos$.next(freeze(new Map(infos)))
  }

  startSyncing() {
    const syncWallets = () => {
      if (this.#isSyncing$.value) return

      this.#isSyncing$.next(true)

      from(this.hydrate())
        .pipe(
          concatMap(({wallets}) => {
            this.resetSyncWalletInfos(wallets)
            return from(wallets)
          }),
          concatMap((wallet) => {
            logger.debug('WalletManager: syncAll syncing walet', {walletId: wallet.id})
            const syncWalletInfo: SyncWalletInfo = {status: 'syncing', updatedAt: Date.now(), id: wallet.id}
            const infos = new Map(this.#syncWalletInfos$.value)
            infos.set(wallet.id, syncWalletInfo)
            this.#syncWalletInfos$.next(freeze(infos))
            return from(wallet.sync({isForced: false})).pipe(
              catchError((error) => {
                logger.error('WalletManager: syncAll error syncing walet', {error, walletId: wallet.id})
                const syncWalletInfo: SyncWalletInfo = {status: 'error', error, updatedAt: Date.now(), id: wallet.id}
                const infos = new Map(this.#syncWalletInfos$.value)
                infos.set(wallet.id, syncWalletInfo)
                this.#syncWalletInfos$.next(freeze(infos))
                return of()
              }),
              finalize(() => {
                if (this.#syncWalletInfos$.value.get(wallet.id)?.status !== 'error') {
                  logger.debug('WalletManager: syncAll done syncing walet', {walletId: wallet.id})
                  const syncWalletInfo: SyncWalletInfo = {status: 'done', updatedAt: Date.now(), id: wallet.id}
                  const infos = new Map(this.#syncWalletInfos$.value)
                  infos.set(wallet.id, syncWalletInfo)
                  this.#syncWalletInfos$.next(freeze(infos))
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
          switchMap((isActive) => (isActive ? interval(this.#syncInterval).pipe(startWith(0)) : of())),
          concatMap(() => of(syncWallets())),
        )
        .subscribe()
    }

    return () => {
      this.#syncSubscription?.unsubscribe()
      this.#syncSubscription = null
    }
  }

  /**
   * It populates the wallet manager with the wallets stored in the storage
   * and ensures that after a wallet is loaded that instance is returned on subsequent calls
   * A wallet should be instantianted only here, otherwise the stream mechanism wont work
   *
   * @returns {Promise<{wallets: YoroiWallet[]; metas: WalletMeta[]}>}
   */
  async hydrate() {
    const deletedWalletIds = await this.walletIdsMarkedForDeletion()
    const walletIds = await this.#walletsRootStorage
      .getAllKeys()
      .then((ids) => ids.filter((id) => !deletedWalletIds.includes(id)))
    const walletMetas = await this.#walletsRootStorage
      .multiGet(walletIds, parseWalletMeta)
      .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))
      .then((walletMetas) => walletMetas.filter(isWalletMeta)) // filter corrupted wallet metas)

    const toLoad = walletMetas.filter((meta) => !this.#walletMetas$.value.has(meta.id))

    // metas dictates wallets to be loaded
    if (toLoad.length > 0) {
      const loadedWallets = await Promise.all(toLoad.map((meta) => this.loadWallet(meta)))
      for (const wallet of loadedWallets) this.#wallets.set(wallet.id, wallet)

      const metas = new Map(this.#walletMetas$.value)
      for (const meta of toLoad) metas.set(meta.id, meta)
      this.#walletMetas$.next(freeze(metas))
    }

    return {wallets: Array.from(this.#wallets.values()), metas: Array.from(this.#walletMetas$.value.values())}
  }

  async walletIdsMarkedForDeletion() {
    const ids = await this.#rootStorage.getItem('deletedWalletIds', parseDeletedWalletIds)

    return ids ?? []
  }

  async removeWalletsMarkedForDeletion() {
    const deletedWalletsIds = await this.walletIdsMarkedForDeletion()
    if (!deletedWalletsIds) return

    await Promise.all(
      deletedWalletsIds.map(async (id) => {
        const encryptedStorage = makeWalletEncryptedStorage(id)

        await this.#walletsRootStorage.removeItem(id) // remove wallet meta
        await this.#walletsRootStorage.removeFolder(`${id}/`) // remove wallet folder
        await encryptedStorage.rootKey.remove() // remove auth with password
        await this.#keychainManager?.removeWalletKey(id) // remove auth with os
      }),
    )

    await this.#rootStorage.setItem('deletedWalletIds', [])
  }

  _notify = (event: WalletManagerEvent | WalletEvent) => {
    this.#subscriptions.forEach((handler) => handler(event))
  }

  subscribe(subscription: (event: WalletManagerEvent | WalletEvent) => void) {
    this.#subscriptions.push(subscription)

    return () => {
      this.#subscriptions = this.#subscriptions.filter((sub) => sub !== subscription)
    }
  }

  async disableEasyConfirmation(id: YoroiWallet['id']) {
    if (!this.#keychainManager) {
      const error = new Error('KeychainManager not available for disableEasyConfirmation')
      logger.error(error)
      throw error
    }

    await this.#keychainManager.removeWalletKey(id)

    this.updateMeta(id, {
      isEasyConfirmationEnabled: false,
    })
  }

  async enableEasyConfirmation(walletId: YoroiWallet['id'], password: string) {
    if (!this.#keychainManager) {
      const error = new Error('KeychainManager not available for enableEasyConfirmation')
      logger.error(error)
      throw error
    }

    const wallet = this.#wallets.get(walletId)
    if (!wallet) {
      const error = new Error('WalletManager: enableEasyConfirmation wallet not found (should be loaded)')
      logger.error(error, {walletId})
      throw error
    }

    const rootKey = await wallet.encryptedStorage.rootKey.read(password)
    this.#keychainManager.setWalletKey(wallet.id, rootKey)

    this.updateMeta(wallet.id, {
      isEasyConfirmationEnabled: true,
    })
  }

  renameWallet(id: YoroiWallet['id'], name: string) {
    this.updateMeta(id, {name})
  }

  changeWalletAddressMode(id: YoroiWallet['id'], addressMode: Wallet.AddressMode) {
    this.updateMeta(id, {addressMode})
  }

  private async saveWallet(wallet: YoroiWallet) {
    await wallet.save()

    return wallet
  }

  /**
   * It loads the wallet only if it's not already loaded
   * if it's already loaded it returns the instance
   *
   * @param {Wallet.Meta} walletMeta
   * @returns {Promise<YoroiWallet>} wallet
   */
  private async loadWallet(walletMeta: Wallet.Meta): Promise<YoroiWallet> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.#wallets.has(walletMeta.id)) return this.#wallets.get(walletMeta.id)!

    const network = this.selectedNetwork
    const {id, implementation} = walletMeta
    const walletFactory = getWalletFactory({network, implementation})
    const networkManager = this.#networkManagers[network]

    const storage = this.#walletsRootStorage.join(`${id}/`)

    const wallet = await walletFactory.restore({
      storage,
      walletMeta,
      networkManager,
    })

    wallet.subscribe((event) => this._notify(event))

    return wallet
  }

  /**
   * It doesn't remove the wallet from the storage right away
   * it marks it for deletion and removes it on the next call to removeWalletsMarkedForDeletion
   * which usually happens on the next app start
   *
   * The reason for that is that while unmounting a wallet it might be in the middle of syncing
   * and it wasn't properly handled in the past, leaving UI and storage in an inconsistent state
   *
   * @param {YoroiWallet['id']} id
   */
  async removeWallet(id: string) {
    const deletedWalletIds = await this.walletIdsMarkedForDeletion()
    await this.#rootStorage.setItem('deletedWalletIds', [...deletedWalletIds, id])

    // can't update the walletInfo here cuz it might be in the middle of wallet syncing
    this.#wallets.delete(id)
    const metas = new Map(this.#walletMetas$.value)
    metas.delete(id)
    this.#walletMetas$.next(freeze(metas))
  }

  async updateHWDeviceInfo(wallet: YoroiWallet, hwDeviceInfo: HW.DeviceInfo) {
    wallet.hwDeviceInfo = hwDeviceInfo
    await this.saveWallet(wallet)
  }

  /**
   * It creates a wallet with the given mnemonic and password
   * and persists it to the storage
   * **It does not hydrate right away**, it will on the next sync call
   * or if manually called by the client
   *
   * @param {string} name
   * @param {string} mnemonic
   * @param {string} password
   * @param {Wallet.Implementation} implementation
   * @param {Wallet.AddressMode} addressMode
   * @returns {Promise<YoroiWallet>} wallet
   * @throws {Error} if the wallet factory is not found
   */
  async createWalletMnemonic(
    name: string,
    mnemonic: string,
    password: string,
    implementation: Wallet.Implementation,
    addressMode: Wallet.AddressMode,
  ) {
    const network = this.selectedNetwork

    const walletFactory = getWalletFactory({network, implementation})
    const id = uuid.v4()
    const networkManager = this.#networkManagers[network]

    const storage = this.#walletsRootStorage.join(`${id}/`)

    const {csl, release} = wrappedCsl()
    const {rootKey, accountPubKeyHex} = await walletFactory.makeKeys({mnemonic, csl})
    release()

    const wallet = await walletFactory.createFromXPriv({
      storage,
      id,
      networkManager,
      accountPubKeyHex,
    })

    await wallet.encryptedStorage.rootKey.write(rootKey, password)

    const {ImagePart: seed, TextPart: plate} = walletFactory.calcChecksum(accountPubKeyHex)
    const avatar = new Blockies().asBase64({seed})

    const meta: Wallet.Meta = {
      version: WalletManager.version,
      id,
      name,
      avatar,
      plate,
      implementation,

      addressMode,
      isReadOnly: false,
      isEasyConfirmationEnabled: false,
      isHW: false,
    }
    await this.#walletsRootStorage.setItem(id, meta)

    return this.saveWallet(wallet)
  }

  /**
   * It creates a wallet with the given xpub key
   * and persists it to the storage
   * **It does not hydrate right away**, it will on the next sync call
   * or if manually called by the client
   *
   * @param {string} name
   * @param {string} accountPubKeyHex
   * @param {Wallet.Implementation} implementation
   * @param {HW.DeviceInfo | null} hwDeviceInfo
   * @param {boolean} isReadOnly
   * @param {Wallet.AddressMode} addressMode
   * @returns {Promise<YoroiWallet>} wallet
   * @throws {Error} if the wallet factory is not found
   */
  async createWalletXPub(
    name: string,
    accountPubKeyHex: string,
    implementation: Wallet.Implementation,
    hwDeviceInfo: null | HW.DeviceInfo,
    isReadOnly: boolean,
    addressMode: Wallet.AddressMode,
  ) {
    const network = this.selectedNetwork

    const walletFactory = getWalletFactory({network, implementation})
    const id = uuid.v4()
    const networkManager = this.#networkManagers[network]

    const storage = this.#walletsRootStorage.join(`${id}/`)

    const wallet = await walletFactory.createFromXPub({
      storage,
      id,
      accountPubKeyHex,
      hwDeviceInfo,
      isReadOnly,
      networkManager,
    })

    const {ImagePart: seed, TextPart: plate} = walletFactory.calcChecksum(accountPubKeyHex)
    const avatar = new Blockies().asBase64({seed})

    const meta: Wallet.Meta = {
      version: WalletManager.version,
      id,
      name,
      avatar,
      plate,
      implementation,

      addressMode,
      isReadOnly,
      isEasyConfirmationEnabled: false,
      isHW: hwDeviceInfo !== null,
    }
    await this.#walletsRootStorage.setItem(id, meta)

    return this.saveWallet(wallet)
  }
}

export const mockWalletManager = {} as WalletManager

const parseDeletedWalletIds = (data: unknown) => {
  const isWalletIds = (data: unknown): data is Array<string> => {
    return !!data && Array.isArray(data) && data.every((item) => typeof item === 'string')
  }
  const parsed = parseSafe(data)

  return isWalletIds(parsed) ? parsed : undefined
}
