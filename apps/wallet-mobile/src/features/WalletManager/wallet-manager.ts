import {walletChecksum} from '@emurgo/cip4-js'
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
import {throwLoggedError} from '../../kernel/logger/helpers/throw-logged-error'
import {logger} from '../../kernel/logger/logger'
import {makeWalletEncryptedStorage} from '../../kernel/storage/EncryptedStorage'
import {Keychain, KeychainManager} from '../../kernel/storage/Keychain'
import {rootStorage} from '../../kernel/storage/rootStorage'
import {keyManager} from '../../yoroi-wallets/cardano/key-manager/key-manager'
import {WalletEvent, YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {wrappedCsl} from '../../yoroi-wallets/cardano/wrappedCsl'
import {validatePassword, validateWalletName} from '../../yoroi-wallets/utils/validators'
import {networkManagers} from './common/constants'
import {
  SyncWalletInfo,
  SyncWalletInfos,
  WalletManagerEvent,
  WalletManagerOptions,
  WalletManagerSubscription,
} from './common/types'
import {isWalletMeta, parseWalletMeta} from './common/validators/wallet-meta'
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
    meta: Partial<Pick<Wallet.Meta, 'addressMode' | 'isEasyConfirmationEnabled' | 'name' | 'hwDeviceInfo'>>,
  ) {
    const walletMeta = this.#walletMetas$.value.get(id)
    if (!walletMeta) throwLoggedError('WalletManager: updateMeta meta not found')

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
    logger.debug('WalletManager: setSelectedNetwork new network selected', {network})
    this.hydrate({isForced: true, network}).then(() => {
      this.#selectedNetwork$.next(network)
      this.restartSyncing()
    })
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
      const syncWalletInfo: SyncWalletInfo = {
        status: 'waiting',
        updatedAt: Date.now(),
        id: wallet.id,
        network: infos.get(wallet.id)?.network ?? null,
      }
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
            const info = this.#syncWalletInfos$.value.get(wallet.id)
            const syncWalletInfo: SyncWalletInfo = {
              status: 'syncing',
              updatedAt: Date.now(),
              id: wallet.id,
              network: info?.network ?? null,
            }
            const infos = new Map(this.#syncWalletInfos$.value)
            infos.set(wallet.id, syncWalletInfo)
            this.#syncWalletInfos$.next(freeze(infos))
            return from(wallet.sync({isForced: false})).pipe(
              catchError((error) => {
                logger.error('WalletManager: syncAll error syncing walet', {error, walletId: wallet.id})
                const syncWalletInfo: SyncWalletInfo = {
                  status: 'error',
                  error,
                  updatedAt: Date.now(),
                  id: wallet.id,
                  network: this.selectedNetwork,
                }
                const infos = new Map(this.#syncWalletInfos$.value)
                infos.set(wallet.id, syncWalletInfo)
                this.#syncWalletInfos$.next(freeze(infos))
                return of()
              }),
              finalize(() => {
                if (this.#syncWalletInfos$.value.get(wallet.id)?.status !== 'error') {
                  logger.debug('WalletManager: syncAll done syncing walet', {walletId: wallet.id})
                  const syncWalletInfo: SyncWalletInfo = {
                    status: 'done',
                    updatedAt: Date.now(),
                    id: wallet.id,
                    network: this.selectedNetwork,
                  }
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
  }

  /**
   * It destroys the stream, while pause is just a temporary stop in the emitter
   */
  stopSyncing() {
    this.#syncSubscription?.unsubscribe()
    this.#syncSubscription = null
  }

  restartSyncing() {
    this.stopSyncing()
    this.startSyncing()
  }

  /**
   * It populates the wallet manager with the wallets stored in the storage
   * and ensures that after a wallet is loaded that instance is returned on subsequent calls
   * A wallet should be instantianted only here, otherwise the stream mechanism wont work
   *
   * @returns {Promise<{wallets: YoroiWallet[]; metas: WalletMeta[]}>}
   */
  async hydrate({
    isForced = false,
    network = this.selectedNetwork,
  }: {isForced?: boolean; network?: Chain.SupportedNetworks} = {}) {
    const deletedWalletIds = await this.walletIdsMarkedForDeletion()
    const walletIds = await this.#walletsRootStorage
      .getAllKeys()
      .then((ids) => ids.filter((id) => !deletedWalletIds.includes(id)))
    const walletMetas = await this.#walletsRootStorage
      .multiGet(walletIds, parseWalletMeta)
      .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))
      .then((walletMetas) => walletMetas.filter(isWalletMeta)) // filter corrupted wallet metas

    const metasToLoad = walletMetas.filter((meta) => !this.#walletMetas$.value.has(meta.id) || isForced)

    // metas dictates wallets to be loaded
    if (metasToLoad.length > 0) {
      const loadedWallets = await Promise.all(
        metasToLoad.map(({id, implementation}) =>
          this.loadWallet({
            id,
            implementation,
            isForced,
            network,
          }),
        ),
      )
      for (const wallet of loadedWallets) this.#wallets.set(wallet.id, wallet)

      const metas = new Map(this.#walletMetas$.value)
      for (const meta of metasToLoad) metas.set(meta.id, meta)
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
        for (const networkManager of Object.values(this.#networkManagers)) {
          await networkManager.legacyRootStorage.removeItem(id)
        }

        await this.#walletsRootStorage.removeItem(id) // remove wallet meta
        await encryptedStorage.xpriv.remove() // remove auth with password
        await encryptedStorage.xpub.clear() // remove all accounts

        await this.#keychainManager?.removeWalletKey(id) // remove auth with os
      }),
    )

    await this.#rootStorage.setItem('deletedWalletIds', [])
  }

  checksum(publicKeyHex: string) {
    const {TextPart, ImagePart} = walletChecksum(publicKeyHex)

    return {
      plate: TextPart,
      seed: ImagePart,
    }
  }

  isWalletAccountDuplicated(publicKeyHex: string) {
    const {plate} = this.checksum(publicKeyHex)

    const walletDuplicatedMeta = Array.from(this.walletMetas.values()).find((walletMeta) => walletMeta.plate === plate)

    const isWalletDuplicated = walletDuplicatedMeta !== undefined

    return isWalletDuplicated
  }

  validateWalletName(newName: string, oldName: string | null = null) {
    const walletNames = Array.from(this.walletMetas.values()).map(({name}) => name)
    const nameErrors = validateWalletName(newName, oldName, walletNames)

    return nameErrors
  }

  async generateWalletKeys(walletImplementation: Wallet.Implementation, mnemonic: string, accountVisual?: number) {
    const {csl, release} = wrappedCsl()
    const keys = await keyManager(walletImplementation)({mnemonic, csl, accountVisual})
    release()

    return keys
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
    if (!this.#keychainManager) throwLoggedError('WalletManager: disableEasyConfirmation KeychainManager not available')

    await this.#keychainManager.removeWalletKey(id)

    this.updateMeta(id, {
      isEasyConfirmationEnabled: false,
    })
  }

  async enableEasyConfirmation(id: YoroiWallet['id'], password: string) {
    if (!this.#keychainManager) throwLoggedError('WalletManager: enableEasyConfirmation KeychainManager not available')

    const encryptedStorage = makeWalletEncryptedStorage(id)
    const rootKey = await encryptedStorage.xpriv.read(password)
    this.#keychainManager.setWalletKey(id, rootKey)

    this.updateMeta(id, {
      isEasyConfirmationEnabled: true,
    })
  }

  renameWallet(id: YoroiWallet['id'], name: string) {
    this.updateMeta(id, {name})
  }

  changeWalletAddressMode(id: YoroiWallet['id'], addressMode: Wallet.AddressMode) {
    this.updateMeta(id, {addressMode})
  }

  updateWalletHWDeviceInfo(id: YoroiWallet['id'], hwDeviceInfo: HW.DeviceInfo) {
    this.updateMeta(id, {hwDeviceInfo})
  }

  async changeWalletPassword({
    id,
    oldPassword,
    newPassword,
  }: {
    id: YoroiWallet['id']
    oldPassword: string
    newPassword: string
  }) {
    const validationResult = validatePassword(newPassword, newPassword)
    if (Object.keys(validationResult).length > 0) {
      logger.error('WalletManager: changeWalletPassword new password is not valid', {id})
      throw new Error('New password is not valid')
    }

    const encryptedStorage = makeWalletEncryptedStorage(id)
    const rootKey = await encryptedStorage.xpriv.read(oldPassword)
    return encryptedStorage.xpriv.write(rootKey, newPassword)
  }

  /**
   * It loads the wallet only if it's not already loaded
   * if it's already loaded it returns the instance
   *
   * @param {Wallet.Meta} walletMeta
   * @returns {Promise<YoroiWallet>} wallet
   */
  private async loadWallet({
    id,
    implementation,
    accountVisual = 0,
    isForced = false,
    network = this.selectedNetwork,
  }: {
    id: YoroiWallet['id']
    implementation: Wallet.Implementation
    accountVisual?: number
    isForced?: boolean
    network?: Chain.SupportedNetworks
  }): Promise<YoroiWallet> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.#wallets.has(id) && !isForced) return this.#wallets.get(id)!

    const walletFactory = getWalletFactory({network, implementation})

    const encryptedStorage = makeWalletEncryptedStorage(id)
    const accountPubKeyHex = await encryptedStorage.xpub.read(accountVisual)

    logger.debug('WalletManager: loadWallet loading wallet', {id, accountVisual, implementation, isForced})
    if (!accountPubKeyHex) throwLoggedError('WalletManager: loadWallet accountPubKeyHex not found')

    const wallet = await walletFactory.build({
      id,
      accountPubKeyHex,
      accountVisual,
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

  async createWalletMnemonic({
    name,
    mnemonic,
    password,
    implementation,
    addressMode,
    accountVisual,
  }: {
    name: string
    mnemonic: string
    password: string
    implementation: Wallet.Implementation
    addressMode: Wallet.AddressMode
    accountVisual: number
  }) {
    const network = this.selectedNetwork

    const walletFactory = getWalletFactory({network, implementation})
    const id = uuid.v4()

    const {csl, release} = wrappedCsl()
    const {rootKey, accountPubKeyHex} = await walletFactory.makeKeys({mnemonic, csl})
    release()

    const encryptedStorage = makeWalletEncryptedStorage(id)
    await encryptedStorage.xpriv.write(rootKey, password)
    await encryptedStorage.xpub.write(accountVisual, accountPubKeyHex)

    const {ImagePart: seed, TextPart: plate} = walletFactory.calcChecksum(accountPubKeyHex)
    const avatar = new Blockies({seed}).asBase64()

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
      hwDeviceInfo: null,
    }
    await this.#walletsRootStorage.setItem(id, meta)
    await this.hydrate()
    return meta
  }

  async createWalletXPub({
    name,
    accountPubKeyHex,
    implementation,
    hwDeviceInfo,
    isReadOnly,
    addressMode,
    accountVisual,
  }: {
    name: string
    accountPubKeyHex: string
    implementation: Wallet.Implementation
    hwDeviceInfo: null | HW.DeviceInfo
    isReadOnly: boolean
    addressMode: Wallet.AddressMode
    accountVisual: number
  }) {
    const network = this.selectedNetwork

    const walletFactory = getWalletFactory({network, implementation})
    const id = uuid.v4()

    const {ImagePart: seed, TextPart: plate} = walletFactory.calcChecksum(accountPubKeyHex)
    const avatar = new Blockies({seed}).asBase64()

    const encryptedStorage = makeWalletEncryptedStorage(id)
    await encryptedStorage.xpub.write(accountVisual, accountPubKeyHex)

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
      hwDeviceInfo,
    }
    await this.#walletsRootStorage.setItem(id, meta)
    await this.hydrate()
    return meta
  }
}

export const walletManager = new WalletManager({networkManagers, rootStorage, keychainManager: Keychain})

export const mockWalletManager = {} as WalletManager

const parseDeletedWalletIds = (data: unknown) => {
  const isWalletIds = (data: unknown): data is Array<string> => {
    return !!data && Array.isArray(data) && data.every((item) => typeof item === 'string')
  }
  const parsed = parseSafe(data)

  return isWalletIds(parsed) ? parsed : undefined
}
