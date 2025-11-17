import {difference, parseSafe, time} from '@yoroi/common'
import {Blockies} from '@yoroi/identicon'
import {App, Chain, HW, Network, Wallet} from '@yoroi/types'

import {walletChecksum} from '@emurgo/cip4-js'
import {Buffer} from 'buffer'
import {freeze} from 'immer'
import {
  BehaviorSubject,
  Subscription,
  catchError,
  concatMap,
  finalize,
  from,
  interval,
  of,
  startWith,
  switchMap,
} from 'rxjs'
import {v4} from 'uuid'

import {throwLoggedError} from '~/kernel/logger/helpers/throw-logged-error'
import {logger} from '~/kernel/logger/logger'
import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'
import {Keychain, KeychainManager} from '~/kernel/storage/Keychain'
import {rootStorage} from '~/kernel/storage/storages'
import {
  deriveAccountFromRootKey,
  keyManager,
} from '~/wallets/cardano/key-manager/key-manager'
import {WalletEvent, YoroiWallet} from '~/wallets/cardano/types'
import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'
import {validatePassword, validateWalletName} from '~/wallets/utils/validators'

import {networkManagers} from './common/constants'
import {
  SyncWalletInfo,
  SyncWalletInfos,
  WalletManagerEvent,
  WalletManagerOptions,
  WalletManagerSubscription,
} from './common/types'
import {isWalletMeta, parseWalletMeta} from './common/validators/wallet-meta'
import {getWalletFactory} from './network-manager/get-wallet-factory'

export class WalletManager {
  // keep it in sync with storage version
  static readonly version = 3
  readonly #wallets: Map<YoroiWallet['id'], YoroiWallet> = new Map()
  readonly #walletMetas$ = new BehaviorSubject<
    Map<YoroiWallet['id'], Wallet.Meta>
  >(new Map())
  readonly #syncWalletInfos$ = new BehaviorSubject<SyncWalletInfos>(
    freeze(new Map()),
  )
  readonly #selectedWalletId$ = new BehaviorSubject<YoroiWallet['id'] | null>(
    null,
  )
  readonly #selectedNetwork$ = new BehaviorSubject<Chain.SupportedNetworks>(
    Chain.Network.Mainnet,
  )
  readonly #isSyncing$ = new BehaviorSubject<boolean>(false)
  readonly #syncControl$ = new BehaviorSubject<boolean>(true)

  #syncSubscription: Subscription | null = null
  #syncInterval = time.seconds(35)

  // injected (constructor)
  readonly #keychainManager?: KeychainManager
  readonly #rootStorage: App.Storage
  readonly #networkManagers: Readonly<
    Record<Chain.SupportedNetworks, Network.Manager>
  >

  // @deprecated legacy to be replaced by networkManager.rootStorage
  readonly #walletsRootStorage: App.Storage

  // @deprecated should consume one of the streams
  #subscriptions: Array<WalletManagerSubscription> = []

  constructor({
    keychainManager,
    rootStorage,
    networkManagers,
  }: WalletManagerOptions) {
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
    meta: Partial<
      Pick<
        Wallet.Meta,
        'addressMode' | 'isEasyConfirmationEnabled' | 'name' | 'hwDeviceInfo'
      >
    >,
  ) {
    const walletMeta = this.#walletMetas$.value.get(id)
    if (!walletMeta)
      throwLoggedError('WalletManager: updateMeta meta not found')

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
    logger.debug('WalletManager: setSelectedNetwork new network selected', {
      network,
    })
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
    const openedWalletsByNetwork = new Map<
      Chain.SupportedNetworks,
      Set<YoroiWallet['id']>
    >()

    this.#wallets.forEach(({id, networkManager: {network}}) => {
      if (!openedWalletsByNetwork.has(network))
        openedWalletsByNetwork.set(network, new Set())

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
      logger.debug(
        'WalletManager: resetSyncWalletInfos deleting wallet from sync list',
        {id},
      )
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
            logger.debug('syncWallets: started', {
              walletId: wallet.id,
              origin: 'WalletManager',
            })
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
                logger.error('syncWallets: error', {
                  error,
                  walletId: wallet.id,
                  origin: 'WalletManager',
                })
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
                if (
                  this.#syncWalletInfos$.value.get(wallet.id)?.status !==
                  'error'
                ) {
                  logger.debug('syncWallets: done', {
                    walletId: wallet.id,
                    origin: 'WalletManager',
                  })
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
          switchMap((isActive) =>
            isActive ? interval(this.#syncInterval).pipe(startWith(0)) : of(),
          ),
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

    // Update walletMetas$ immediately with all metadata from storage
    // This ensures hasWallets is accurate before wallets are fully loaded
    // (which may involve slow network calls)
    const allMetas = new Map(this.#walletMetas$.value)
    for (const meta of walletMetas) {
      if (!allMetas.has(meta.id) || isForced) {
        allMetas.set(meta.id, meta)
      }
    }
    if (allMetas.size !== this.#walletMetas$.value.size || isForced) {
      this.#walletMetas$.next(freeze(allMetas))
    }

    const metasToLoad = walletMetas.filter(
      (meta) => !this.#wallets.has(meta.id) || isForced,
    )

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
    }

    return {
      wallets: Array.from(this.#wallets.values()),
      metas: Array.from(this.#walletMetas$.value.values()),
    }
  }

  async walletIdsMarkedForDeletion() {
    const ids = await this.#rootStorage.getItem(
      'deletedWalletIds',
      parseDeletedWalletIds,
    )

    return ids ?? []
  }

  async removeWalletsMarkedForDeletion() {
    const deletedWalletsIds = await this.walletIdsMarkedForDeletion()
    if (!deletedWalletsIds) return

    await Promise.all(
      deletedWalletsIds.map(async (id) => {
        const encryptedStorage = makeWalletEncryptedStorage(id)
        // Remove wallet data from legacy storage paths for each network
        for (const network of Object.keys(
          this.#networkManagers,
        ) as Chain.SupportedNetworks[]) {
          const legacyStorage = this.#rootStorage.join(`legacy/${network}/v1/`)
          await legacyStorage.removeItem(id)
        }

        await this.#walletsRootStorage.removeItem(id) // remove wallet meta
        await encryptedStorage.xpriv.remove() // remove auth with password
        // Note: Currently removes account 0. If multi-account support is added,
        // this should iterate through all accounts and remove them:
        // for (let accountIndex = 0; accountIndex < maxAccounts; accountIndex++) {
        //   await encryptedStorage.xpub.remove(accountIndex)
        // }
        await encryptedStorage.xpub.remove(0) // remove account 0

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

    return Array.from(this.walletMetas.values()).some(
      (walletMeta) => walletMeta.plate === plate,
    )
  }

  findWalletMetadataByPublicKeyHex(publicKeyHex: string) {
    const {plate} = this.checksum(publicKeyHex)

    return Array.from(this.walletMetas.values()).find(
      (walletMeta) => walletMeta.plate === plate,
    )
  }

  validateWalletName(newName: string, oldName: string | null = null) {
    const walletNames = Array.from(this.walletMetas.values()).map(
      ({name}) => name,
    )
    const nameErrors = validateWalletName(newName, oldName, walletNames)

    return nameErrors
  }

  generateWalletKeys(
    walletImplementation: Wallet.Implementation,
    mnemonic: string,
    accountVisual?: number,
  ) {
    return CardanoMobileWrapped.cslScope((csl) =>
      keyManager(walletImplementation)({
        csl,
        mnemonic,
        accountVisual,
      }),
    )
  }

  _notify = (event: WalletManagerEvent | WalletEvent) => {
    this.#subscriptions.forEach((handler) => handler(event))
  }

  subscribe(subscription: (event: WalletManagerEvent | WalletEvent) => void) {
    this.#subscriptions.push(subscription)

    return () => {
      this.#subscriptions = this.#subscriptions.filter(
        (sub) => sub !== subscription,
      )
    }
  }

  async disableEasyConfirmation(id: YoroiWallet['id']) {
    if (!this.#keychainManager)
      throwLoggedError(
        'WalletManager: disableEasyConfirmation KeychainManager not available',
      )

    await this.#keychainManager.removeWalletKey(id)

    this.updateMeta(id, {
      isEasyConfirmationEnabled: false,
    })
  }

  async enableEasyConfirmation(wallet: YoroiWallet, password: string) {
    if (!this.#keychainManager)
      throwLoggedError(
        'WalletManager: enableEasyConfirmation KeychainManager not available',
      )

    const rootKey = await wallet.encryptedStorage.xpriv.read(password)
    this.#keychainManager.setWalletKey(wallet.id, rootKey.value)

    this.updateMeta(wallet.id, {
      isEasyConfirmationEnabled: true,
    })
  }

  renameWallet(id: YoroiWallet['id'], name: string) {
    this.updateMeta(id, {name})
  }

  changeWalletAddressMode(
    id: YoroiWallet['id'],
    addressMode: Wallet.AddressMode,
  ) {
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
      logger.error(
        'WalletManager: changeWalletPassword new password is not valid',
        {id},
      )
      throw new Error('New password is not valid')
    }

    const encryptedStorage = makeWalletEncryptedStorage(id)
    const rootKey = await encryptedStorage.xpriv.read(oldPassword)
    return encryptedStorage.xpriv.write(rootKey.value, newPassword)
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
    if (this.#wallets.has(id) && !isForced) return this.#wallets.get(id)!

    const walletFactory = getWalletFactory({network, implementation})

    // Check if this is a read-only wallet
    const meta = this.#walletMetas$.value.get(id)
    const isReadOnly = meta?.isReadOnly ?? false

    logger.debug('WalletManager: loadWallet loading wallet', {
      id,
      accountVisual,
      implementation,
      isForced,
      isReadOnly,
    })

    if (isReadOnly) {
      // Load read-only wallet from addresses
      const addressStorage = rootStorage.join(
        `legacy/${network}/v1/${id}/addresses/`,
      )
      const readOnlyData = await addressStorage.getItem('readOnly', (data) => {
        const parsed = parseSafe(data)
        if (
          parsed &&
          typeof parsed === 'object' &&
          ('knownAddress' in parsed ||
            'internal' in parsed ||
            'external' in parsed)
        ) {
          return parsed as {
            knownAddress?: string
            internal?: string[]
            external?: string[]
            rewardAddressHex?: string
            enableDiscovery?: boolean
            accountVisual?: number
          }
        }
        return undefined
      })

      if (!readOnlyData) {
        // Fallback: Check if we have accountPubKeyHex stored (for read-only wallets restored from links)
        const encryptedStorage = makeWalletEncryptedStorage(id)
        const accountPubKeyHex = await encryptedStorage.xpub.read(accountVisual)

        if (accountPubKeyHex) {
          // Load as regular wallet (can derive all addresses from accountPubKeyHex)
          // It's still functionally read-only since there's no private key stored
          logger.debug(
            'WalletManager: loadWallet read-only wallet with accountPubKeyHex, loading as regular wallet',
            {id, accountVisual},
          )
          const wallet = await walletFactory.build({
            id,
            accountPubKeyHex,
            accountVisual,
          })

          wallet.subscribe((event) => this._notify(event))

          return wallet
        }

        throwLoggedError(
          'WalletManager: loadWallet read-only address data not found',
        )
      }

      const wallet = await walletFactory.build({
        id,
        accountVisual: readOnlyData.accountVisual ?? accountVisual,
        readOnlyAddresses: {
          knownAddress: readOnlyData.knownAddress,
          internal: readOnlyData.internal,
          external: readOnlyData.external,
          rewardAddressHex: readOnlyData.rewardAddressHex,
          enableDiscovery: readOnlyData.enableDiscovery ?? false,
        },
      })

      wallet.subscribe((event) => this._notify(event))

      return wallet
    } else {
      // Load full wallet from accountPubKeyHex
      const encryptedStorage = makeWalletEncryptedStorage(id)
      const accountPubKeyHex = await encryptedStorage.xpub.read(accountVisual)

      if (!accountPubKeyHex)
        throwLoggedError('WalletManager: loadWallet accountPubKeyHex not found')

      const wallet = await walletFactory.build({
        id,
        accountPubKeyHex,
        accountVisual,
      })

      wallet.subscribe((event) => this._notify(event))

      return wallet
    }
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
    await this.#rootStorage.setItem('deletedWalletIds', [
      ...deletedWalletIds,
      id,
    ])

    // If the removed wallet is the currently selected one, clear the selection
    if (this.#selectedWalletId$.value === id) {
      this.#selectedWalletId$.next(null)
    }

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
    const id = v4()

    const {rootKey, accountPubKeyHex} = CardanoMobileWrapped.cslScope((csl) =>
      walletFactory.makeKeys({
        mnemonic,
        csl,
      }),
    )

    const encryptedStorage = makeWalletEncryptedStorage(id)
    await encryptedStorage.xpriv.write(rootKey, password)
    await encryptedStorage.xpub.write(accountVisual, accountPubKeyHex)

    const {ImagePart: seed, TextPart: plate} =
      walletFactory.calcChecksum(accountPubKeyHex)
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
    const id = v4()

    const {ImagePart: seed, TextPart: plate} =
      walletFactory.calcChecksum(accountPubKeyHex)
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

  /**
   * Validates if a string looks like a valid Cardano address
   */
  private isValidCardanoAddress(address: string): boolean {
    if (!address || typeof address !== 'string') return false
    const trimmed = address.trim()
    return (
      trimmed.startsWith('addr') ||
      trimmed.startsWith('stake') ||
      trimmed.startsWith('Ae2') ||
      trimmed.startsWith('DdzFF') ||
      /^[0-9a-fA-F]{64,}$/.test(trimmed) // Hex address (at least 32 bytes)
    )
  }

  /**
   * Creates a read-only wallet from addresses (without accountPubKeyHex)
   * This allows creating a partial read-only view of a wallet using only known addresses
   */
  async createReadOnlyWalletFromAddresses({
    name,
    knownAddress,
    internalAddresses = [],
    externalAddresses = [],
    rewardAddressHex,
    implementation,
    addressMode,
    accountVisual,
    enableDiscovery = false,
  }: {
    name: string
    knownAddress?: string
    internalAddresses?: string[]
    externalAddresses?: string[]
    rewardAddressHex?: string
    implementation: Wallet.Implementation
    addressMode: Wallet.AddressMode
    accountVisual: number
    enableDiscovery?: boolean
  }) {
    const network = this.selectedNetwork
    const walletFactory = getWalletFactory({network, implementation})
    const id = v4()

    // Filter out invalid addresses
    const validKnownAddress =
      knownAddress && this.isValidCardanoAddress(knownAddress)
        ? knownAddress
        : undefined
    const validInternalAddresses = internalAddresses.filter((addr) =>
      this.isValidCardanoAddress(addr),
    )
    const validExternalAddresses = externalAddresses.filter((addr) =>
      this.isValidCardanoAddress(addr),
    )

    // Validate we have at least one valid address
    if (
      !validKnownAddress &&
      validInternalAddresses.length === 0 &&
      validExternalAddresses.length === 0
    ) {
      throw new Error(
        'Read-only wallet requires at least one valid Cardano address',
      )
    }

    // Derive reward address if not provided and we have a base address
    let finalRewardAddressHex = rewardAddressHex
    if (!finalRewardAddressHex) {
      const addressToUse =
        validExternalAddresses[0] ||
        validInternalAddresses[0] ||
        validKnownAddress
      if (addressToUse && this.isValidCardanoAddress(addressToUse)) {
        try {
          const chainId = networkManagers[network].chainId
          const rewardAddressBech32 = CardanoMobileWrapped.cslScope((csl) => {
            const addr = csl.Address.fromBech32(addressToUse)
            const baseAddr = csl.BaseAddress.fromAddress(addr)
            if (!baseAddr) {
              throw new Error('Address is not a base address')
            }
            const stakeCred = baseAddr.stakeCred()
            const rewardAddr = csl.RewardAddress.new(chainId, stakeCred)
            return rewardAddr.toAddress().toBech32(undefined)
          })

          if (typeof rewardAddressBech32 === 'string') {
            finalRewardAddressHex = CardanoMobileWrapped.cslScope((csl) => {
              const addr = csl.Address.fromBech32(rewardAddressBech32)
              return Buffer.from(addr.toBytes()).toString('hex')
            })
          }
        } catch (error) {
          logger.warn('Failed to derive reward address', {error})
          finalRewardAddressHex = ''
        }
      }
    }

    // Generate checksum from reward address or first address for avatar/plate
    const checksumSource = finalRewardAddressHex
      ? Buffer.from(finalRewardAddressHex, 'hex').toString('hex')
      : validExternalAddresses[0] ||
        validInternalAddresses[0] ||
        validKnownAddress ||
        ''

    const {ImagePart: seed, TextPart: plate} =
      walletFactory.calcChecksum(checksumSource)
    const avatar = new Blockies({seed}).asBase64()

    // Store addresses for persistence (not in encrypted storage since no private keys)
    const addressStorage = rootStorage.join(
      `legacy/${network}/v1/${id}/addresses/`,
    )
    await addressStorage.setItem('readOnly', {
      knownAddress: validKnownAddress,
      internal: validInternalAddresses,
      external: validExternalAddresses,
      rewardAddressHex: finalRewardAddressHex,
      enableDiscovery,
      accountVisual,
    })

    const meta: Wallet.Meta = {
      version: WalletManager.version,
      id,
      name,
      avatar,
      plate,
      implementation,
      addressMode,
      isReadOnly: true,
      isEasyConfirmationEnabled: false,
      isHW: false,
      hwDeviceInfo: null,
    }
    await this.#walletsRootStorage.setItem(id, meta)
    await this.hydrate()
    return meta
  }

  /**
   * Derives and stores accountPubKeyHex for any accountVisual from an existing wallet's root key
   * This allows deriving multiple accounts from a single root key
   */
  async deriveAndStoreAccount({
    id,
    accountVisual,
    password,
  }: {
    id: string
    accountVisual: number
    password: string
  }): Promise<string> {
    // Read root key
    const encryptedStorage = makeWalletEncryptedStorage(id)
    const rootKeyResult = await encryptedStorage.xpriv.read(password)
    const rootKeyHex = rootKeyResult.value

    // Get wallet meta to determine implementation
    const meta = await this.#walletsRootStorage.getItem(id, parseWalletMeta)
    if (!meta) {
      throwLoggedError('WalletManager: deriveAndStoreAccount wallet not found')
    }

    // Derive accountPubKeyHex for the specified accountVisual
    const accountPubKeyHex = CardanoMobileWrapped.cslScope((csl) =>
      deriveAccountFromRootKey(
        rootKeyHex,
        accountVisual,
        meta.implementation,
        csl,
      ),
    )

    // Store it
    await encryptedStorage.xpub.write(accountVisual, accountPubKeyHex)

    return accountPubKeyHex
  }

  /**
   * Creates a wallet from a root key hex (for restoration from links)
   */
  async createWalletFromRootKey({
    name,
    rootKeyHex,
    password,
    implementation,
    addressMode,
    accountVisual,
  }: {
    name: string
    rootKeyHex: string
    password: string
    implementation: Wallet.Implementation
    addressMode: Wallet.AddressMode
    accountVisual: number
  }) {
    const network = this.selectedNetwork

    const walletFactory = getWalletFactory({network, implementation})
    const id = v4()

    // Derive accountPubKeyHex from rootKeyHex
    const accountPubKeyHex = CardanoMobileWrapped.cslScope((csl) =>
      deriveAccountFromRootKey(rootKeyHex, accountVisual, implementation, csl),
    )

    const encryptedStorage = makeWalletEncryptedStorage(id)
    await encryptedStorage.xpriv.write(rootKeyHex, password)
    await encryptedStorage.xpub.write(accountVisual, accountPubKeyHex)

    const {ImagePart: seed, TextPart: plate} =
      walletFactory.calcChecksum(accountPubKeyHex)
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
}

export const walletManager = new WalletManager({
  networkManagers,
  rootStorage,
  keychainManager: Keychain,
})

const parseDeletedWalletIds = (data: unknown) => {
  const isWalletIds = (data: unknown): data is Array<string> => {
    return (
      !!data &&
      Array.isArray(data) &&
      data.every((item) => typeof item === 'string')
    )
  }
  const parsed = parseSafe(data)

  return isWalletIds(parsed) ? parsed : undefined
}
