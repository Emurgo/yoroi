import {cardanoConfig} from '@yoroi/blockchains'
import {parseSafe} from '@yoroi/common'
import {Blockies} from '@yoroi/identicon'
import {Chain, HW, Network, Portfolio, Wallet} from '@yoroi/types'

import {walletChecksum} from '@emurgo/cip4-js'
import {Buffer} from 'buffer'
import {freeze} from 'immer'
import {BehaviorSubject, Observable, Subscription} from 'rxjs'
import {v4} from 'uuid'

import {getLogger, throwLoggedError} from '@yoroi/common'
// TODO: Storage dependencies need to be injected via WalletManagerOptions:
// - makeWalletEncryptedStorage should be passed as a factory function
// - Keychain should be passed as a dependency (currently using global)
// - rootStorage is already in WalletManagerOptions, but some code still uses global
import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'
import {Keychain} from '~/kernel/storage/Keychain'
import {rootStorage} from '~/kernel/storage/storages'
import {createCardanoWalletDependencies} from '~/common/wallet-dependencies'
import {deriveAddressFromXPub} from '@yoroi/cardano-wallet/account-manager/derive-address-from-xpub'
import {keyManager} from '@yoroi/cardano-wallet/key-manager/key-manager'
import {WalletEvent, YoroiWallet} from '@yoroi/cardano-wallet/types'
import {deriveRewardAddressHex} from '@yoroi/cardano-wallet/utils'
import {CardanoMobileWrapped} from '@yoroi/cardano-wallet/wrappedCsl'
import {validatePassword, validateWalletName} from '@yoroi/cardano-wallet/utils/validators'

import {networkManagers} from './common/constants'
import {
  SyncWalletInfo,
  WalletManagerEvent,
  WalletManagerOptions,
  WalletManagerSubscription,
} from './common/types'
import {isWalletMeta, parseWalletMeta} from './common/validators/wallet-meta'
import {
  createWalletFromMnemonic,
  createWalletFromRootKey,
  createWalletFromXPub as createWalletFromXPubFn,
  deriveAndStoreAccount,
} from './creation/wallet-creation'
import {
  getWalletFactory,
  initializeWalletFactories,
} from './network-manager/get-wallet-factory'
import {
  createWalletManagerStateSubjects,
  setSelectedNetwork,
  setSelectedWalletId,
  setSyncControl,
  updateSyncWalletInfos,
  updateWalletMetas,
} from './state/wallet-manager-state'
import type {SyncManager} from './sync/sync-manager'
import {makeSyncManager} from './sync/sync-manager'

/**
 * Wallet Manager version
 * Keep it in sync with storage version
 */
export const WALLET_MANAGER_VERSION = 3

/**
 * Wallet Manager type
 * Functional API for wallet management
 */
export type WalletManager = {
  readonly version: number
  readonly selectedWalledId: YoroiWallet['id'] | null
  readonly selectedWalletId$: Observable<YoroiWallet['id'] | null>
  readonly selectedNetwork: Chain.SupportedNetworks
  readonly selectedNetwork$: Observable<Chain.SupportedNetworks>
  readonly walletMetas$: Observable<Map<YoroiWallet['id'], Wallet.Meta>>
  readonly hasWallets: boolean
  readonly walletMetas: Map<YoroiWallet['id'], Wallet.Meta>
  readonly selectedNetworkManager: Network.Manager
  readonly syncWalletInfos$: Observable<Map<YoroiWallet['id'], SyncWalletInfo>>
  readonly syncing$: Observable<boolean>
  readonly isSyncing: boolean
  readonly syncActive$: Observable<boolean>
  readonly isSyncActive: boolean
  setSelectedWalletId(id: YoroiWallet['id']): void
  setSelectedNetwork(network: Chain.SupportedNetworks): void
  pauseSyncing(): void
  resumeSyncing(): void
  startSyncing(): void
  stopSyncing(): void
  restartSyncing(): void
  hydrate(params?: {
    isForced?: boolean
    network?: Chain.SupportedNetworks
  }): Promise<{wallets: YoroiWallet[]; metas: Wallet.Meta[]}>
  walletIdsMarkedForDeletion(): Promise<string[]>
  removeWalletsMarkedForDeletion(): Promise<void>
  removeWallet(id: string): Promise<void>
  notifyTransactionSubmitted(walletId: YoroiWallet['id'], txId: string): void
  createWalletMnemonic(params: {
    name: string
    mnemonic: string
    password: string
    implementation: Wallet.Implementation
    addressMode: Wallet.AddressMode
    accountVisual: number
  }): Promise<Wallet.Meta>
  createWalletXPub(params: {
    name: string
    accountPubKeyHex: string
    implementation: Wallet.Implementation
    hwDeviceInfo: null | HW.DeviceInfo
    isReadOnly: boolean
    addressMode: Wallet.AddressMode
    accountVisual: number
  }): Promise<Wallet.Meta>
  createReadOnlyWalletFromAddresses(params: {
    name: string
    knownAddress?: string
    internalAddresses?: string[]
    externalAddresses?: string[]
    rewardAddressHex?: string
    implementation: Wallet.Implementation
    addressMode: Wallet.AddressMode
    accountVisual: number
    enableDiscovery?: boolean
  }): Promise<Wallet.Meta>
  deriveAndStoreAccount(params: {
    id: string
    accountVisual: number
    password: string
  }): Promise<string>
  createWalletFromRootKey(params: {
    name: string
    rootKeyHex: string
    password: string
    implementation: Wallet.Implementation
    addressMode: Wallet.AddressMode
    accountVisual: number
  }): Promise<Wallet.Meta>
  getNetworkManager(network: Chain.SupportedNetworks): Network.Manager
  getTokenManager(network: Chain.SupportedNetworks): Portfolio.Manager.Token
  getWalletsByNetwork(): Map<Chain.SupportedNetworks, Set<YoroiWallet['id']>>
  getWalletById(id: YoroiWallet['id']): YoroiWallet | undefined
  getWalletMetaById(id: YoroiWallet['id']): Wallet.Meta | undefined
  checksum(publicKeyHex: string): {plate: string; seed: string}
  isWalletAccountDuplicated(publicKeyHex: string): boolean
  findWalletMetadataByPublicKeyHex(
    publicKeyHex: string,
  ): Wallet.Meta | undefined
  validateWalletName(
    newName: string,
    oldName?: string | null,
  ): {mustBeFilled?: boolean; tooLong?: boolean; nameAlreadyTaken?: boolean}
  generateWalletKeys(
    walletImplementation: Wallet.Implementation,
    mnemonic: string,
    accountVisual?: number,
  ): {rootKey: string; accountPubKeyHex: string}
  subscribe(
    subscription: (event: WalletManagerEvent | WalletEvent) => void,
  ): () => void
  disableEasyConfirmation(id: YoroiWallet['id']): Promise<void>
  enableEasyConfirmation(wallet: YoroiWallet, password: string): Promise<void>
  renameWallet(id: YoroiWallet['id'], name: string): void
  changeWalletAddressMode(
    id: YoroiWallet['id'],
    addressMode: Wallet.AddressMode,
  ): void
  updateWalletHWDeviceInfo(
    id: YoroiWallet['id'],
    hwDeviceInfo: HW.DeviceInfo,
  ): void
  changeWalletPassword(params: {
    id: YoroiWallet['id']
    oldPassword: string
    newPassword: string
  }): Promise<void>
}

/**
 * Create a functional wallet manager
 */
export const makeWalletManager = (
  options: WalletManagerOptions,
): WalletManager => {
  const {
    keychainManager,
    rootStorage,
    networkManagers,
    cardanoWalletDependencies,
  } = options

  // Initialize wallet factories with dependencies
  initializeWalletFactories(cardanoWalletDependencies)

  // State management
  const stateSubjects = createWalletManagerStateSubjects()

  // Internal state
  const wallets = new Map<YoroiWallet['id'], YoroiWallet>()
  const walletsRootStorage = rootStorage.join('wallet/')
  const subscriptions: Array<WalletManagerSubscription> = []

  // Sync management
  let syncSubscription: Subscription | null = null
  let syncManager: SyncManager | null = null
  let syncManagerSubscription: Subscription | null = null

  // Initialize sync manager
  const initializeSyncManager = () => {
    const wallets$ = new BehaviorSubject<YoroiWallet[]>([])
    const selectedWalletId$ = stateSubjects.selectedWalletId.asObservable()
    const selectedNetwork$ = stateSubjects.selectedNetwork.asObservable()

    syncManager = makeSyncManager(
      wallets$.asObservable(),
      selectedWalletId$,
      selectedNetwork$,
    )

    syncManagerSubscription = syncManager.syncWalletInfos$.subscribe(
      (syncInfos) => {
        updateSyncWalletInfos(stateSubjects, syncInfos)
      },
    )
  }

  initializeSyncManager()

  // Helper: Update wallet meta
  const updateMeta = (
    id: Wallet.Meta['id'],
    meta: Partial<
      Pick<
        Wallet.Meta,
        'addressMode' | 'isEasyConfirmationEnabled' | 'name' | 'hwDeviceInfo'
      >
    >,
  ): void => {
    const walletMeta = stateSubjects.walletMetas.value.get(id)
    if (!walletMeta)
      throwLoggedError(getLogger())('WalletManager: updateMeta meta not found')

    const newMeta: Wallet.Meta = {...walletMeta, ...meta}
    const newMetas = new Map(stateSubjects.walletMetas.value)
    newMetas.set(id, newMeta)
    updateWalletMetas(stateSubjects, newMetas)
    getLogger().info('WalletManager: update meta', {from: walletMeta, to: newMeta})

    walletsRootStorage.setItem(id, newMeta).catch((error) => {
      getLogger().error(error, {id})
    })
  }

  // Helper: Notify subscribers
  const notify = (event: WalletManagerEvent | WalletEvent) => {
    subscriptions.forEach((handler) => handler(event))
  }

  // Helper: Validate Cardano address
  const isValidCardanoAddress = (address: string): boolean => {
    if (!address || typeof address !== 'string') return false
    const trimmed = address.trim()
    return (
      trimmed.startsWith('addr') ||
      trimmed.startsWith('stake') ||
      trimmed.startsWith('Ae2') ||
      trimmed.startsWith('DdzFF') ||
      /^[0-9a-fA-F]{64,}$/.test(trimmed)
    )
  }

  // Helper: Parse deleted wallet IDs
  const parseDeletedWalletIds = (data: unknown) => {
    const isWalletIds = (data: unknown): data is Array<string> => {
      return (
        !!data &&
        Array.isArray(data) &&
        data.every((item) => typeof item === 'string')
      )
    }
    const parsed = parseSafe(data)
    return isWalletIds(parsed) ? parsed : []
  }

  // Helper: Load wallets with error handling - skips corrupted wallets
  const loadWalletsSafely = async (
    metasToLoad: Array<{
      id: YoroiWallet['id']
      implementation: Wallet.Implementation
    }>,
    options: {isForced?: boolean; network?: Chain.SupportedNetworks} = {},
  ): Promise<YoroiWallet[]> => {
    const walletResults = await Promise.allSettled(
      metasToLoad.map(({id, implementation}) =>
        loadWallet({
          id,
          implementation,
          isForced: options.isForced ?? false,
          network: options.network ?? stateSubjects.selectedNetwork.value,
        }),
      ),
    )
    const loadedWallets: YoroiWallet[] = []
    for (const result of walletResults) {
      if (result.status === 'fulfilled') {
        loadedWallets.push(result.value)
      } else {
        getLogger().warn('WalletManager: Failed to load wallet', {
          error: result.reason,
        })
      }
    }
    return loadedWallets
  }

  // Helper: Load wallet
  const loadWallet = async ({
    id,
    implementation,
    accountVisual = 0,
    isForced = false,
    network = stateSubjects.selectedNetwork.value,
  }: {
    id: YoroiWallet['id']
    implementation: Wallet.Implementation
    accountVisual?: number
    isForced?: boolean
    network?: Chain.SupportedNetworks
  }): Promise<YoroiWallet> => {
    if (wallets.has(id) && !isForced) return wallets.get(id)!

    const walletFactory = getWalletFactory({network, implementation})
    const meta = stateSubjects.walletMetas.value.get(id)
    const isReadOnly = meta?.isReadOnly ?? false

    getLogger().debug('WalletManager: loadWallet loading wallet', {
      id,
      accountVisual,
      implementation,
      isForced,
      isReadOnly,
    })

    if (isReadOnly) {
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
          const rawData = parsed as {
            knownAddress?: string
            internal?: string[]
            external?: string[]
            rewardAddressHex?: string
            enableDiscovery?: boolean
            accountVisual?: number
          }

          // Filter out invalid addresses when loading from storage
          const validKnownAddress =
            rawData.knownAddress && isValidCardanoAddress(rawData.knownAddress)
              ? rawData.knownAddress
              : undefined

          const validInternal =
            rawData.internal?.filter((addr) => isValidCardanoAddress(addr)) ??
            []
          const validExternal =
            rawData.external?.filter((addr) => isValidCardanoAddress(addr)) ??
            []

          // Log if we filtered out invalid addresses
          if (
            rawData.knownAddress &&
            rawData.knownAddress !== validKnownAddress
          ) {
            getLogger().warn(
              'WalletManager: loadWallet filtered invalid knownAddress from storage',
              {
                walletId: id,
                invalidAddress: rawData.knownAddress,
                addressLength: rawData.knownAddress.length,
              },
            )
          }

          if (
            rawData.internal &&
            rawData.internal.length !== validInternal.length
          ) {
            getLogger().debug(
              'WalletManager: loadWallet filtered invalid internal addresses',
              {
                walletId: id,
                originalCount: rawData.internal.length,
                validCount: validInternal.length,
              },
            )
          }

          if (
            rawData.external &&
            rawData.external.length !== validExternal.length
          ) {
            getLogger().debug(
              'WalletManager: loadWallet filtered invalid external addresses',
              {
                walletId: id,
                originalCount: rawData.external.length,
                validCount: validExternal.length,
              },
            )
          }

          return {
            ...rawData,
            knownAddress: validKnownAddress,
            internal: validInternal,
            external: validExternal,
          }
        }
        return undefined
      })

      if (!readOnlyData) {
        const encryptedStorage = makeWalletEncryptedStorage(id)
        const accountPubKeyHex = await encryptedStorage.xpub.read(accountVisual)

        if (accountPubKeyHex) {
          getLogger().debug(
            'WalletManager: loadWallet read-only wallet with accountPubKeyHex, loading as regular wallet',
            {id, accountVisual},
          )
          const wallet = await walletFactory.build({
            id,
            accountPubKeyHex,
            accountVisual,
          })

          wallet.subscribe((event) => notify(event))
          return wallet
        }

        // When switching networks, read-only wallets may not have data for the new network
        // This is expected behavior, so log as debug instead of error
        getLogger().debug(
          'WalletManager: loadWallet read-only address data not found for network',
          {id, network, accountVisual},
        )
        throw new Error(
          `Read-only wallet ${id} has no address data for network ${network}`,
        )
      }

      // Check if we have at least one valid address after filtering
      const hasValidAddresses =
        (readOnlyData.knownAddress && readOnlyData.knownAddress.length > 0) ||
        (readOnlyData.internal && readOnlyData.internal.length > 0) ||
        (readOnlyData.external && readOnlyData.external.length > 0)

      if (!hasValidAddresses) {
        getLogger().error(
          'WalletManager: loadWallet read-only wallet has no valid addresses after filtering - removing corrupted wallet',
          {
            walletId: id,
            originalKnownAddress: readOnlyData.knownAddress,
            originalInternalCount: readOnlyData.internal?.length ?? 0,
            originalExternalCount: readOnlyData.external?.length ?? 0,
          },
        )
        // Automatically remove corrupted wallet
        try {
          // Remove wallet metadata
          await walletsRootStorage.removeItem(id)

          // Remove wallet storage folder
          const addressStorage = rootStorage.join(
            `legacy/${network}/v1/${id}/addresses/`,
          )
          await addressStorage.removeItem('readOnly')

          // Remove encrypted storage
          const encryptedStorage = makeWalletEncryptedStorage(id)
          await encryptedStorage.xpriv.remove()
          await encryptedStorage.xpub.remove(0)
          await keychainManager?.removeWalletKey(id)

          // Remove from wallet metas if present
          const metas = new Map(stateSubjects.walletMetas.value)
          if (metas.has(id)) {
            metas.delete(id)
            updateWalletMetas(stateSubjects, freeze(metas))
          }

          // Remove from wallets map if present
          wallets.delete(id)

          getLogger().info(
            'WalletManager: loadWallet removed corrupted read-only wallet',
            {walletId: id},
          )
        } catch (error) {
          getLogger().error(
            'WalletManager: loadWallet failed to remove corrupted wallet',
            {walletId: id, error},
          )
        }
        // Throw error to skip loading this wallet
        throw new Error(
          `Read-only wallet ${id} is corrupted - no valid addresses found`,
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

      wallet.subscribe((event) => notify(event))
      return wallet
    } else {
      const encryptedStorage = makeWalletEncryptedStorage(id)
      const accountPubKeyHex = await encryptedStorage.xpub.read(accountVisual)

      if (!accountPubKeyHex)
        throwLoggedError(getLogger())('WalletManager: loadWallet accountPubKeyHex not found')

      const wallet = await walletFactory.build({
        id,
        accountPubKeyHex,
        accountVisual,
      })

      wallet.subscribe((event) => notify(event))
      return wallet
    }
  }

  // Public API
  return {
    version: WALLET_MANAGER_VERSION,

    // State getters
    get selectedWalledId() {
      return stateSubjects.selectedWalletId.value
    },
    get selectedWalletId$() {
      return stateSubjects.selectedWalletId.asObservable()
    },
    get selectedNetwork() {
      return stateSubjects.selectedNetwork.value
    },
    get selectedNetwork$() {
      return stateSubjects.selectedNetwork.asObservable()
    },
    get walletMetas$() {
      return stateSubjects.walletMetas.asObservable()
    },
    get hasWallets() {
      return stateSubjects.walletMetas.value.size > 0
    },
    get walletMetas() {
      return stateSubjects.walletMetas.value
    },
    get selectedNetworkManager() {
      return networkManagers[stateSubjects.selectedNetwork.value]
    },
    get syncWalletInfos$() {
      return stateSubjects.syncWalletInfos.asObservable()
    },
    get syncing$() {
      return stateSubjects.isSyncing.asObservable()
    },
    get isSyncing() {
      return stateSubjects.isSyncing.value
    },
    get syncActive$() {
      return stateSubjects.syncControl.asObservable()
    },
    get isSyncActive() {
      return stateSubjects.syncControl.value
    },

    // State setters
    setSelectedWalletId(id: YoroiWallet['id']) {
      getLogger().debug('WalletManager: setSelectedWalletId new wallet selected', {
        id,
      })
      setSelectedWalletId(stateSubjects, id)
    },

    setSelectedNetwork(network: Chain.SupportedNetworks) {
      getLogger().debug('WalletManager: setSelectedNetwork new network selected', {
        network,
      })
      // Use hydrate logic directly (same as hydrate method below)
      const hydrateFn = async () => {
        const deletedWalletIds = await parseDeletedWalletIds(
          await rootStorage.getItem('deletedWalletIds'),
        )
        const walletIds = await walletsRootStorage
          .getAllKeys()
          .then((ids) => ids.filter((id) => !deletedWalletIds.includes(id)))
        const walletMetas = await walletsRootStorage
          .multiGet(walletIds, parseWalletMeta)
          .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))
          .then((walletMetas) => walletMetas.filter(isWalletMeta))

        const allMetas = new Map(stateSubjects.walletMetas.value)
        for (const meta of walletMetas) {
          if (!allMetas.has(meta.id)) {
            allMetas.set(meta.id, meta)
          }
        }
        if (allMetas.size !== stateSubjects.walletMetas.value.size) {
          updateWalletMetas(stateSubjects, freeze(allMetas))
        }

        // Reload ALL wallets with the new network (not just new ones)
        // This ensures wallets get the correct networkManager for the new network
        const metasToLoad = walletMetas

        if (metasToLoad.length > 0) {
          const loadedWallets = await loadWalletsSafely(metasToLoad, {
            isForced: true,
            network,
          })
          // Clear existing wallets and replace with reloaded ones
          wallets.clear()
          for (const wallet of loadedWallets) wallets.set(wallet.id, wallet)

          if (syncManager) {
            syncManager.updateWallets(Array.from(wallets.values()))
          }
        }

        return {
          wallets: Array.from(wallets.values()),
          metas: Array.from(stateSubjects.walletMetas.value.values()),
        }
      }

      hydrateFn().then(() => {
        setSelectedNetwork(stateSubjects, network)
        syncManager?.updateNetwork(network)
        // Restart syncing after network change
        if (syncManager) {
          syncManager.stop()
          syncManager.start()
        }
      })
    },

    pauseSyncing() {
      getLogger().debug('WalletManager: pauseSyncing requested')
      setSyncControl(stateSubjects, false)
    },

    resumeSyncing() {
      getLogger().debug('WalletManager: resumeSyncing requested')
      setSyncControl(stateSubjects, true)
    },

    startSyncing() {
      if (syncManager) {
        // Create a reference to hydrate method
        const hydrateFn = async () => {
          const deletedWalletIds = await parseDeletedWalletIds(
            await rootStorage.getItem('deletedWalletIds'),
          )
          const walletIds = await walletsRootStorage
            .getAllKeys()
            .then((ids) => ids.filter((id) => !deletedWalletIds.includes(id)))
          const walletMetas = await walletsRootStorage
            .multiGet(walletIds, parseWalletMeta)
            .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))
            .then((walletMetas) => walletMetas.filter(isWalletMeta))

          const allMetas = new Map(stateSubjects.walletMetas.value)
          for (const meta of walletMetas) {
            if (!allMetas.has(meta.id)) {
              allMetas.set(meta.id, meta)
            }
          }
          if (allMetas.size !== stateSubjects.walletMetas.value.size) {
            updateWalletMetas(stateSubjects, freeze(allMetas))
          }

          const metasToLoad = walletMetas.filter(
            (meta) => !wallets.has(meta.id),
          )

          if (metasToLoad.length > 0) {
            const loadedWallets = await loadWalletsSafely(metasToLoad, {
              isForced: false,
              network: stateSubjects.selectedNetwork.value,
            })
            for (const wallet of loadedWallets) wallets.set(wallet.id, wallet)
          }

          return {
            wallets: Array.from(wallets.values()),
            metas: Array.from(stateSubjects.walletMetas.value.values()),
          }
        }

        hydrateFn()
          .then(() => {
            syncManager?.updateWallets(Array.from(wallets.values()))
            syncManager?.updateNetwork(stateSubjects.selectedNetwork.value)
            syncManager?.start()
          })
          .catch((error) => {
            getLogger().error('WalletManager: Error hydrating wallets for sync', {
              error,
            })
          })

        if (!syncSubscription) {
          syncSubscription = stateSubjects.syncControl.subscribe((isActive) => {
            if (isActive) {
              syncManager?.resume()
            } else {
              syncManager?.pause()
            }
          })
        }
      }
    },

    stopSyncing() {
      if (syncManager) {
        syncManager.stop()
      }
      syncManagerSubscription?.unsubscribe()
      syncManagerSubscription = null
      syncSubscription?.unsubscribe()
      syncSubscription = null
    },

    restartSyncing() {
      if (syncManager) {
        syncManager.stop()
      }
      syncManagerSubscription?.unsubscribe()
      syncManagerSubscription = null
      syncSubscription?.unsubscribe()
      syncSubscription = null
      // Re-initialize sync manager
      initializeSyncManager()
      // Start syncing again
      const hydrateFn = async () => {
        const deletedWalletIds = await parseDeletedWalletIds(
          await rootStorage.getItem('deletedWalletIds'),
        )
        const walletIds = await walletsRootStorage
          .getAllKeys()
          .then((ids) => ids.filter((id) => !deletedWalletIds.includes(id)))
        const walletMetas = await walletsRootStorage
          .multiGet(walletIds, parseWalletMeta)
          .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))
          .then((walletMetas) => walletMetas.filter(isWalletMeta))

        const allMetas = new Map(stateSubjects.walletMetas.value)
        for (const meta of walletMetas) {
          if (!allMetas.has(meta.id)) {
            allMetas.set(meta.id, meta)
          }
        }
        if (allMetas.size !== stateSubjects.walletMetas.value.size) {
          updateWalletMetas(stateSubjects, freeze(allMetas))
        }

        const metasToLoad = walletMetas.filter((meta) => !wallets.has(meta.id))

        if (metasToLoad.length > 0) {
          const loadedWallets = await loadWalletsSafely(metasToLoad, {
            isForced: false,
            network: stateSubjects.selectedNetwork.value,
          })
          for (const wallet of loadedWallets) wallets.set(wallet.id, wallet)
        }

        return {
          wallets: Array.from(wallets.values()),
          metas: Array.from(stateSubjects.walletMetas.value.values()),
        }
      }

      hydrateFn().then(() => {
        if (syncManager) {
          syncManager.updateWallets(Array.from(wallets.values()))
          syncManager.updateNetwork(stateSubjects.selectedNetwork.value)
          syncManager.start()
        }

        if (!syncSubscription) {
          syncSubscription = stateSubjects.syncControl.subscribe((isActive) => {
            if (isActive) {
              syncManager?.resume()
            } else {
              syncManager?.pause()
            }
          })
        }
      })
    },

    async hydrate({
      isForced = false,
      network = stateSubjects.selectedNetwork.value,
    }: {isForced?: boolean; network?: Chain.SupportedNetworks} = {}) {
      // Clean up any wallets that were marked for deletion before the refactor
      // (now removeWallet deletes immediately, but we need to clean up old marked wallets)
      await this.removeWalletsMarkedForDeletion()

      const deletedWalletIds = await parseDeletedWalletIds(
        await rootStorage.getItem('deletedWalletIds'),
      )
      const walletIds = await walletsRootStorage
        .getAllKeys()
        .then((ids) => ids.filter((id) => !deletedWalletIds.includes(id)))
      const walletMetas = await walletsRootStorage
        .multiGet(walletIds, parseWalletMeta)
        .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))
        .then((walletMetas) => walletMetas.filter(isWalletMeta))

      const allMetas = new Map(stateSubjects.walletMetas.value)
      for (const meta of walletMetas) {
        if (!allMetas.has(meta.id) || isForced) {
          allMetas.set(meta.id, meta)
        }
      }
      if (allMetas.size !== stateSubjects.walletMetas.value.size || isForced) {
        updateWalletMetas(stateSubjects, freeze(allMetas))
      }

      const metasToLoad = walletMetas.filter(
        (meta) => !wallets.has(meta.id) || isForced,
      )

      if (metasToLoad.length > 0) {
        const loadedWallets = await loadWalletsSafely(metasToLoad, {
          isForced,
          network,
        })
        for (const wallet of loadedWallets) wallets.set(wallet.id, wallet)

        if (syncManager) {
          syncManager.updateWallets(Array.from(wallets.values()))
        }
      }

      return {
        wallets: Array.from(wallets.values()),
        metas: Array.from(stateSubjects.walletMetas.value.values()),
      }
    },

    async walletIdsMarkedForDeletion() {
      const ids = await rootStorage.getItem('deletedWalletIds')
      return parseDeletedWalletIds(ids)
    },

    async removeWalletsMarkedForDeletion() {
      const deletedWalletsIds = await parseDeletedWalletIds(
        await rootStorage.getItem('deletedWalletIds'),
      )
      if (!deletedWalletsIds || deletedWalletsIds.length === 0) return

      await Promise.all(
        deletedWalletsIds.map(async (id) => {
          const encryptedStorage = makeWalletEncryptedStorage(id)
          for (const network of Object.keys(
            networkManagers,
          ) as Chain.SupportedNetworks[]) {
            const legacyStorage = rootStorage.join(`legacy/${network}/v1/`)
            // Use removeFolder to recursively delete the entire wallet folder
            await legacyStorage.removeFolder(`${id}/`).catch((error) => {
              getLogger().warn(
                'WalletManager: removeWalletsMarkedForDeletion failed to remove wallet folder',
                {
                  walletId: id,
                  network,
                  error,
                },
              )
            })
          }

          await walletsRootStorage.removeItem(id)
          await encryptedStorage.xpriv.remove()
          await encryptedStorage.xpub.remove(0)
          await keychainManager?.removeWalletKey(id)
        }),
      )

      await rootStorage.setItem('deletedWalletIds', [])
    },

    async removeWallet(id: string) {
      getLogger().debug('WalletManager: removeWallet deleting wallet', {
        walletId: id,
      })

      // Remove from in-memory state first
      if (stateSubjects.selectedWalletId.value === id) {
        setSelectedWalletId(stateSubjects, null)
      }

      wallets.delete(id)
      const metas = new Map(stateSubjects.walletMetas.value)
      metas.delete(id)
      updateWalletMetas(stateSubjects, freeze(metas))

      if (syncManager) {
        syncManager.updateWallets(Array.from(wallets.values()))
      }

      // Actually delete wallet files from storage
      try {
        const encryptedStorage = makeWalletEncryptedStorage(id)

        // Remove wallet metadata
        await walletsRootStorage.removeItem(id)

        // Remove wallet storage for all networks
        // Use removeFolder to recursively delete the entire wallet folder (txs, utxos, memos, addresses, etc.)
        for (const network of Object.keys(
          networkManagers,
        ) as Chain.SupportedNetworks[]) {
          const legacyStorage = rootStorage.join(`legacy/${network}/v1/`)
          await legacyStorage.removeFolder(`${id}/`).catch((error) => {
            getLogger().warn(
              'WalletManager: removeWallet failed to remove wallet folder',
              {
                walletId: id,
                network,
                error,
              },
            )
          })
        }

        // Remove encrypted storage
        await encryptedStorage.xpriv.remove().catch(() => {
          // Ignore if doesn't exist
        })
        await encryptedStorage.xpub.remove(0).catch(() => {
          // Ignore if doesn't exist
        })

        // Remove keychain entry
        await keychainManager?.removeWalletKey(id).catch(() => {
          // Ignore if doesn't exist
        })

        getLogger().info('WalletManager: removeWallet successfully deleted wallet', {
          walletId: id,
        })
      } catch (error) {
        getLogger().error(
          'WalletManager: removeWallet failed to delete wallet files',
          {
            walletId: id,
            error,
          },
        )
        // Still remove from deletedWalletIds list if it was there
        const deletedWalletIds = await parseDeletedWalletIds(
          await rootStorage.getItem('deletedWalletIds'),
        )
        if (deletedWalletIds.includes(id)) {
          await rootStorage.setItem(
            'deletedWalletIds',
            deletedWalletIds.filter((deletedId) => deletedId !== id),
          )
        }
        throw error
      }
    },

    notifyTransactionSubmitted(walletId: YoroiWallet['id'], txId: string) {
      if (syncManager) {
        syncManager.notifyTransactionSubmitted({
          walletId,
          txId,
          timestamp: Date.now(),
        })
      }
    },

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
      const meta = await createWalletFromMnemonic(
        {
          name,
          mnemonic,
          password,
          implementation,
          addressMode,
          accountVisual,
          network: stateSubjects.selectedNetwork.value,
          version: WALLET_MANAGER_VERSION,
        },
        cardanoWalletDependencies.makeWalletEncryptedStorage,
      )

      await walletsRootStorage.setItem(meta.id, meta)
      // Hydrate to load the new wallet
      const deletedWalletIds = await parseDeletedWalletIds(
        await rootStorage.getItem('deletedWalletIds'),
      )
      const walletIds = await walletsRootStorage
        .getAllKeys()
        .then((ids) => ids.filter((id) => !deletedWalletIds.includes(id)))
      const walletMetas = await walletsRootStorage
        .multiGet(walletIds, parseWalletMeta)
        .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))
        .then((walletMetas) => walletMetas.filter(isWalletMeta))

      const allMetas = new Map(stateSubjects.walletMetas.value)
      for (const m of walletMetas) {
        if (!allMetas.has(m.id)) {
          allMetas.set(m.id, m)
        }
      }
      if (allMetas.size !== stateSubjects.walletMetas.value.size) {
        updateWalletMetas(stateSubjects, freeze(allMetas))
      }

      const metasToLoad = walletMetas.filter((m) => !wallets.has(m.id))
      if (metasToLoad.length > 0) {
        const loadedWallets = await Promise.all(
          metasToLoad.map(({id, implementation}) =>
            loadWallet({
              id,
              implementation,
              isForced: false,
              network: stateSubjects.selectedNetwork.value,
            }),
          ),
        )
        for (const wallet of loadedWallets) wallets.set(wallet.id, wallet)
        if (syncManager) {
          syncManager.updateWallets(Array.from(wallets.values()))
        }
      }
      return meta
    },

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
      const network = stateSubjects.selectedNetwork.value
      const meta = await createWalletFromXPubFn({
        name,
        accountPubKeyHex,
        implementation,
        hwDeviceInfo,
        isReadOnly,
        addressMode,
        accountVisual,
        network,
        version: WALLET_MANAGER_VERSION,
      })

      // For read-only wallets, derive and store at least one address
      // This is required for loadWallet to work properly
      if (isReadOnly) {
        try {
          const chainId = networkManagers[network].chainId
          const implementationConfig =
            cardanoConfig.implementations[implementation]
          const externalRole =
            implementationConfig.derivations.base.roles.external

          // Derive the first external address (index 0)
          const addresses = await deriveAddressFromXPub({
            accountPubKeyHex,
            chainId,
            role: externalRole,
            implementation,
            count: 1,
          })

          if (addresses.length > 0) {
            const firstAddress = addresses[0]
            // Derive reward address if staking is supported
            let rewardAddressHex = ''
            if (implementationConfig.features.staking) {
              rewardAddressHex = deriveRewardAddressHex(
                accountPubKeyHex,
                chainId,
                implementationConfig.features.staking.derivation.role,
                implementationConfig.features.staking.derivation.index,
              )
            }

            // Store address data in address storage
            const addressStorage = rootStorage.join(
              `legacy/${network}/v1/${meta.id}/addresses/`,
            )
            await addressStorage.setItem('readOnly', {
              knownAddress: firstAddress,
              internal: [],
              external: [firstAddress],
              rewardAddressHex,
              enableDiscovery: true, // Enable discovery to find more addresses
              accountVisual,
            })

            getLogger().info(
              'createWalletXPub: stored initial address for read-only wallet',
              {
                walletId: meta.id,
                address: firstAddress?.substring(0, 20) + '...',
              },
            )
          }
        } catch (error) {
          getLogger().error(
            'createWalletXPub: failed to derive address for read-only wallet',
            {
              error,
              walletId: meta.id,
              errorMessage:
                error instanceof Error ? error.message : String(error),
            },
          )
          // Don't throw - let loadWallet handle the fallback using accountPubKeyHex
        }
      }

      await walletsRootStorage.setItem(meta.id, meta)
      // Hydrate to load the new wallet (same pattern as createWalletMnemonic)
      const deletedWalletIds = await parseDeletedWalletIds(
        await rootStorage.getItem('deletedWalletIds'),
      )
      const walletIds = await walletsRootStorage
        .getAllKeys()
        .then((ids) => ids.filter((id) => !deletedWalletIds.includes(id)))
      const walletMetas = await walletsRootStorage
        .multiGet(walletIds, parseWalletMeta)
        .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))
        .then((walletMetas) => walletMetas.filter(isWalletMeta))

      const allMetas = new Map(stateSubjects.walletMetas.value)
      for (const m of walletMetas) {
        if (!allMetas.has(m.id)) {
          allMetas.set(m.id, m)
        }
      }
      if (allMetas.size !== stateSubjects.walletMetas.value.size) {
        updateWalletMetas(stateSubjects, freeze(allMetas))
      }

      const metasToLoad = walletMetas.filter((m) => !wallets.has(m.id))
      if (metasToLoad.length > 0) {
        const loadedWallets = await Promise.all(
          metasToLoad.map(({id, implementation}) =>
            loadWallet({
              id,
              implementation,
              isForced: false,
              network: stateSubjects.selectedNetwork.value,
            }),
          ),
        )
        for (const wallet of loadedWallets) wallets.set(wallet.id, wallet)
        if (syncManager) {
          syncManager.updateWallets(Array.from(wallets.values()))
        }
      }
      return meta
    },

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
      const network = stateSubjects.selectedNetwork.value
      const walletFactory = getWalletFactory({network, implementation})
      const id = v4()

      const validKnownAddress =
        knownAddress && isValidCardanoAddress(knownAddress)
          ? knownAddress
          : undefined
      const validInternalAddresses = internalAddresses.filter((addr) =>
        isValidCardanoAddress(addr),
      )
      const validExternalAddresses = externalAddresses.filter((addr) =>
        isValidCardanoAddress(addr),
      )

      if (
        !validKnownAddress &&
        validInternalAddresses.length === 0 &&
        validExternalAddresses.length === 0
      ) {
        throw new Error(
          'Read-only wallet requires at least one valid Cardano address',
        )
      }

      let finalRewardAddressHex = rewardAddressHex
      if (!finalRewardAddressHex) {
        const addressToUse =
          validExternalAddresses[0] ||
          validInternalAddresses[0] ||
          validKnownAddress
        if (addressToUse && isValidCardanoAddress(addressToUse)) {
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
            getLogger().warn('Failed to derive reward address', {error})
            finalRewardAddressHex = ''
          }
        }
      }

      const checksumSource = finalRewardAddressHex
        ? Buffer.from(finalRewardAddressHex, 'hex').toString('hex')
        : validExternalAddresses[0] ||
          validInternalAddresses[0] ||
          validKnownAddress ||
          ''

      const {ImagePart: seed, TextPart: plate} =
        walletFactory.calcChecksum(checksumSource)
      const avatar = Blockies({seed}).asBase64()

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
        version: WALLET_MANAGER_VERSION,
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
      await walletsRootStorage.setItem(id, meta)
      // Hydrate to load the new wallet (same pattern as createWalletMnemonic)
      const deletedWalletIds = await parseDeletedWalletIds(
        await rootStorage.getItem('deletedWalletIds'),
      )
      const walletIds = await walletsRootStorage
        .getAllKeys()
        .then((ids) => ids.filter((id) => !deletedWalletIds.includes(id)))
      const walletMetas = await walletsRootStorage
        .multiGet(walletIds, parseWalletMeta)
        .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))
        .then((walletMetas) => walletMetas.filter(isWalletMeta))

      const allMetas = new Map(stateSubjects.walletMetas.value)
      for (const m of walletMetas) {
        if (!allMetas.has(m.id)) {
          allMetas.set(m.id, m)
        }
      }
      if (allMetas.size !== stateSubjects.walletMetas.value.size) {
        updateWalletMetas(stateSubjects, freeze(allMetas))
      }

      const metasToLoad = walletMetas.filter((m) => !wallets.has(m.id))
      if (metasToLoad.length > 0) {
        const loadedWallets = await Promise.all(
          metasToLoad.map(({id, implementation}) =>
            loadWallet({
              id,
              implementation,
              isForced: false,
              network: stateSubjects.selectedNetwork.value,
            }),
          ),
        )
        for (const wallet of loadedWallets) wallets.set(wallet.id, wallet)
        if (syncManager) {
          syncManager.updateWallets(Array.from(wallets.values()))
        }
      }
      return meta
    },

    async deriveAndStoreAccount({
      id,
      accountVisual,
      password,
    }: {
      id: string
      accountVisual: number
      password: string
    }): Promise<string> {
      const meta = await walletsRootStorage.getItem(id, parseWalletMeta)
      if (!meta) {
        throwLoggedError(getLogger())(
          'WalletManager: deriveAndStoreAccount wallet not found',
        )
      }

      const encryptedStorage = makeWalletEncryptedStorage(id)
      const rootKeyResult = await encryptedStorage.xpriv.read(password)
      const rootKeyHex = rootKeyResult.value

      return deriveAndStoreAccount({
        id,
        accountVisual,
        password: rootKeyHex,
        implementation: meta.implementation,
      })
    },

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
      const meta = await createWalletFromRootKey(
        {
          name,
          rootKeyHex,
          password,
          implementation,
          addressMode,
          accountVisual,
          network: stateSubjects.selectedNetwork.value,
          version: WALLET_MANAGER_VERSION,
        },
        cardanoWalletDependencies.makeWalletEncryptedStorage,
      )

      await walletsRootStorage.setItem(meta.id, meta)
      // Hydrate to load the new wallet (same pattern as createWalletMnemonic)
      const deletedWalletIds = await parseDeletedWalletIds(
        await rootStorage.getItem('deletedWalletIds'),
      )
      const walletIds = await walletsRootStorage
        .getAllKeys()
        .then((ids) => ids.filter((id) => !deletedWalletIds.includes(id)))
      const walletMetas = await walletsRootStorage
        .multiGet(walletIds, parseWalletMeta)
        .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))
        .then((walletMetas) => walletMetas.filter(isWalletMeta))

      const allMetas = new Map(stateSubjects.walletMetas.value)
      for (const m of walletMetas) {
        if (!allMetas.has(m.id)) {
          allMetas.set(m.id, m)
        }
      }
      if (allMetas.size !== stateSubjects.walletMetas.value.size) {
        updateWalletMetas(stateSubjects, freeze(allMetas))
      }

      const metasToLoad = walletMetas.filter((m) => !wallets.has(m.id))
      if (metasToLoad.length > 0) {
        const loadedWallets = await Promise.all(
          metasToLoad.map(({id, implementation}) =>
            loadWallet({
              id,
              implementation,
              isForced: false,
              network: stateSubjects.selectedNetwork.value,
            }),
          ),
        )
        for (const wallet of loadedWallets) wallets.set(wallet.id, wallet)
        if (syncManager) {
          syncManager.updateWallets(Array.from(wallets.values()))
        }
      }
      return meta
    },

    getNetworkManager(network: Chain.SupportedNetworks) {
      return networkManagers[network]
    },

    getTokenManager(network: Chain.SupportedNetworks) {
      return networkManagers[network].tokenManager
    },

    getWalletsByNetwork() {
      const openedWalletsByNetwork = new Map<
        Chain.SupportedNetworks,
        Set<YoroiWallet['id']>
      >()

      wallets.forEach((wallet: YoroiWallet) => {
        const {id, networkManager} = wallet
        const network = networkManager.network
        if (!openedWalletsByNetwork.has(network))
          openedWalletsByNetwork.set(network, new Set())

        openedWalletsByNetwork.get(network)?.add(id)
      })

      return openedWalletsByNetwork
    },

    getWalletById(id: YoroiWallet['id']) {
      return wallets.get(id)
    },

    getWalletMetaById(id: YoroiWallet['id']) {
      return stateSubjects.walletMetas.value.get(id)
    },

    checksum(publicKeyHex: string) {
      const {TextPart, ImagePart} = walletChecksum(publicKeyHex)
      return {
        plate: TextPart,
        seed: ImagePart,
      }
    },

    isWalletAccountDuplicated(publicKeyHex: string) {
      const {TextPart: plate} = walletChecksum(publicKeyHex)
      return Array.from(stateSubjects.walletMetas.value.values()).some(
        (walletMeta: Wallet.Meta) => walletMeta.plate === plate,
      )
    },

    findWalletMetadataByPublicKeyHex(publicKeyHex: string) {
      const {TextPart: plate} = walletChecksum(publicKeyHex)
      return Array.from(stateSubjects.walletMetas.value.values()).find(
        (walletMeta: Wallet.Meta) => walletMeta.plate === plate,
      )
    },

    validateWalletName(newName: string, oldName: string | null = null) {
      const walletNames = Array.from(
        stateSubjects.walletMetas.value.values(),
      ).map((walletMeta: Wallet.Meta) => walletMeta.name)
      return validateWalletName(newName, oldName, walletNames)
    },

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
    },

    subscribe(subscription: (event: WalletManagerEvent | WalletEvent) => void) {
      subscriptions.push(subscription)
      return () => {
        const index = subscriptions.indexOf(subscription)
        if (index > -1) subscriptions.splice(index, 1)
      }
    },

    async disableEasyConfirmation(id: YoroiWallet['id']) {
      if (!keychainManager)
        throwLoggedError(getLogger())(
          'WalletManager: disableEasyConfirmation KeychainManager not available',
        )

      await keychainManager.removeWalletKey(id)
      updateMeta(id, {
        isEasyConfirmationEnabled: false,
      })
    },

    async enableEasyConfirmation(wallet: YoroiWallet, password: string) {
      if (!keychainManager)
        throwLoggedError(getLogger())(
          'WalletManager: enableEasyConfirmation KeychainManager not available',
        )

      const rootKey = await wallet.encryptedStorage.xpriv.read(password)
      keychainManager.setWalletKey(wallet.id, rootKey.value)

      updateMeta(wallet.id, {
        isEasyConfirmationEnabled: true,
      })
    },

    renameWallet(id: YoroiWallet['id'], name: string) {
      updateMeta(id, {name})
    },

    changeWalletAddressMode(
      id: YoroiWallet['id'],
      addressMode: Wallet.AddressMode,
    ) {
      updateMeta(id, {addressMode})
    },

    updateWalletHWDeviceInfo(
      id: YoroiWallet['id'],
      hwDeviceInfo: HW.DeviceInfo,
    ) {
      updateMeta(id, {hwDeviceInfo})
    },

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
        getLogger().error(
          'WalletManager: changeWalletPassword new password is not valid',
          {id},
        )
        throw new Error('New password is not valid')
      }

      const encryptedStorage = makeWalletEncryptedStorage(id)
      const rootKey = await encryptedStorage.xpriv.read(oldPassword)
      return encryptedStorage.xpriv.write(rootKey.value, newPassword)
    },
  }
}

export const walletManager = makeWalletManager({
  networkManagers,
  rootStorage,
  keychainManager: Keychain,
  cardanoWalletDependencies: createCardanoWalletDependencies(),
})
