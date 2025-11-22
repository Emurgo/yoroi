import {Chain} from '@yoroi/types'

import {freeze} from 'immer'
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  catchError,
  combineLatest,
  from,
  interval,
  merge,
  of,
  switchMap,
  timer,
} from 'rxjs'

import {logger} from '~/kernel/logger/logger'
import {getTipStatusService} from '~/wallets/cardano/api/tip-status-service'
import {YoroiWallet} from '~/wallets/cardano/types'
import {TipStatusResponse} from '@yoroi/api'

import {SyncWalletInfo} from '../common/types'
import {getNextRetryTime} from './backoff'
import {SyncConfig, defaultSyncConfig} from './sync-config'
import {SyncManagerState, createInitialSyncState} from './sync-state'
import {
  filterWalletsByNetwork,
  prioritizeWallets,
  syncWalletsParallel,
} from './sync-strategies'

/**
 * Transaction submission event
 */
export type TransactionSubmittedEvent = {
  walletId: YoroiWallet['id']
  txId: string
  timestamp: number
}

/**
 * Sync manager interface
 */
export type SyncManager = {
  /** Observable of sync state */
  syncState$: Observable<SyncManagerState>
  /** Observable of sync wallet infos */
  syncWalletInfos$: Observable<Map<YoroiWallet['id'], SyncWalletInfo>>
  /** Start syncing */
  start: () => void
  /** Stop syncing */
  stop: () => void
  /** Pause syncing (temporary) */
  pause: () => void
  /** Resume syncing */
  resume: () => void
  /** Trigger immediate sync for specific wallet */
  triggerSync: (walletId: YoroiWallet['id']) => void
  /** Update wallets list */
  updateWallets: (wallets: YoroiWallet[]) => void
  /** Update selected network */
  updateNetwork: (network: Chain.SupportedNetworks) => void
  /** Notify transaction submission */
  notifyTransactionSubmitted: (event: TransactionSubmittedEvent) => void
}

/**
 * Create sync manager
 */
export const makeSyncManager = (
  wallets$: Observable<YoroiWallet[]>,
  selectedWalletId$: Observable<YoroiWallet['id'] | null>,
  selectedNetwork$: Observable<Chain.SupportedNetworks>,
  config: SyncConfig = defaultSyncConfig,
): SyncManager => {
  const syncState$ = new BehaviorSubject<SyncManagerState>(
    createInitialSyncState(Chain.Network.Mainnet),
  )
  const syncWalletInfos$ = new BehaviorSubject<
    Map<YoroiWallet['id'], SyncWalletInfo>
  >(new Map())

  // Transaction submission events
  const txSubmitted$ = new Subject<TransactionSubmittedEvent>()

  // Internal wallets observable (can be updated manually)
  const internalWallets$ = new BehaviorSubject<YoroiWallet[]>([])

  // Merge external wallets$ with internal updates
  const mergedWallets$ = merge(wallets$, internalWallets$.asObservable())

  let syncSubscription: Subscription | null = null
  let currentWallets: YoroiWallet[] = []
  let currentSelectedWalletId: YoroiWallet['id'] | null = null

  // Helper to update sync state
  const updateSyncState = (
    updater: (state: SyncManagerState) => SyncManagerState,
  ) => {
    const currentState = syncState$.value
    const newState = freeze(updater(currentState))
    syncState$.next(newState)
  }

  // Subscribe to wallets and network changes
  mergedWallets$.subscribe((wallets) => {
    currentWallets = wallets
    updateSyncState((state) => {
      const newWallets = new Map(state.wallets)

      // Update existing wallets and add new ones
      for (const wallet of wallets) {
        const existing = newWallets.get(wallet.id)
        if (existing) {
          // Update wallet reference but keep sync state
          newWallets.set(wallet.id, {
            ...existing,
            wallet,
          })
        } else {
          // New wallet
          newWallets.set(wallet.id, {
            wallet,
            info: {
              id: wallet.id,
              status: 'waiting',
              updatedAt: Date.now(),
              network: null,
            },
            lastSyncTime: 0,
            errorCount: 0,
          })
        }
      }

      // Remove wallets that are no longer in the list
      for (const walletId of newWallets.keys()) {
        if (!wallets.find((w) => w.id === walletId)) {
          newWallets.delete(walletId)
        }
      }

      return {
        ...state,
        wallets: newWallets,
      }
    })
  })

  selectedWalletId$.subscribe((id) => {
    currentSelectedWalletId = id
  })

  selectedNetwork$.subscribe((network) => {
    updateSyncState((state) => ({
      ...state,
      currentNetwork: network,
    }))
  })

  // Helper to update sync wallet infos
  const updateSyncWalletInfos = (
    updater: (
      infos: Map<YoroiWallet['id'], SyncWalletInfo>,
    ) => Map<YoroiWallet['id'], SyncWalletInfo>,
  ) => {
    const currentInfos = syncWalletInfos$.value
    const newInfos = freeze(updater(currentInfos))
    syncWalletInfos$.next(newInfos)
  }

  // Get tip status from network-level service
  const getTipStatusForNetwork = async (
    network: Chain.SupportedNetworks,
    baseApiUrl: string,
  ): Promise<TipStatusResponse | null> => {
    const service = getTipStatusService(network, baseApiUrl)
    return service.fetchTipStatus(false)
  }

  // Perform sync
  const performSync = async (isForced: boolean = false) => {
    const state = syncState$.value

    if (!state.isActive) {
      return
    }

    // Filter wallets by current network
    const networkWallets = filterWalletsByNetwork(
      currentWallets,
      state.currentNetwork,
    )

    if (networkWallets.length === 0) {
      return
    }

    // Fetch tip status once for the network (shared across all wallets)
    // Get baseApiUrl from first wallet (all wallets on same network share same API URL)
    const baseApiUrl = networkWallets[0]?.networkManager.legacyApiBaseUrl || ''
    const tipStatus = await getTipStatusForNetwork(
      state.currentNetwork,
      baseApiUrl,
    )

    if (!tipStatus) {
      logger.warn('syncManager: No tip status available, skipping sync', {
        network: state.currentNetwork,
        origin: 'SyncManager',
      })
      return
    }

    // Prioritize wallets (last selected first)
    const prioritizedWallets = prioritizeWallets(
      networkWallets,
      currentSelectedWalletId,
      state,
    )

    // Store UTXO count before sync for wallet with pending transaction
    let utxoCountBeforeSync: number | undefined
    if (
      state.isFastPolling &&
      state.lastTxSubmissionWalletId &&
      state.lastUtxoCountBeforeSync === undefined
    ) {
      const walletWithPendingTx = currentWallets.find(
        (w) => w.id === state.lastTxSubmissionWalletId,
      )
      if (walletWithPendingTx) {
        utxoCountBeforeSync = walletWithPendingTx.utxos.length
        updateSyncState((s) => ({
          ...s,
          lastUtxoCountBeforeSync: utxoCountBeforeSync,
        }))
      }
    }

    // Sync wallets in parallel (pass shared tip status)
    const syncInfos = await syncWalletsParallel(
      prioritizedWallets,
      config,
      state,
      isForced,
      tipStatus,
    )

    // Get current state after sync (may have been updated to store UTXO count)
    const currentStateAfterSync = syncState$.value

    // Check for UTXO changes and disable fast polling early if detected
    let utxoChanged = false
    if (
      currentStateAfterSync.isFastPolling &&
      currentStateAfterSync.lastTxSubmissionWalletId &&
      currentStateAfterSync.lastUtxoCountBeforeSync !== undefined
    ) {
      const walletWithPendingTx = currentWallets.find(
        (w) => w.id === currentStateAfterSync.lastTxSubmissionWalletId,
      )
      if (walletWithPendingTx) {
        const currentUtxoCount = walletWithPendingTx.utxos.length
        if (
          currentUtxoCount !== currentStateAfterSync.lastUtxoCountBeforeSync
        ) {
          utxoChanged = true
          logger.debug(
            'syncManager: UTXO change detected, switching to normal polling',
            {
              walletId: currentStateAfterSync.lastTxSubmissionWalletId,
              oldCount: currentStateAfterSync.lastUtxoCountBeforeSync,
              newCount: currentUtxoCount,
            },
          )
        }
      }
    }

    // Update state with sync results
    updateSyncState((currentState) => {
      const newWallets = new Map(currentState.wallets)

      for (const [walletId, syncInfo] of syncInfos.entries()) {
        const walletState = newWallets.get(walletId)
        if (!walletState) continue

        const errorCount =
          syncInfo.status === 'error' ? walletState.errorCount + 1 : 0

        newWallets.set(walletId, {
          ...walletState,
          info: syncInfo,
          lastSyncTime: Date.now(),
          errorCount,
          nextRetryTime:
            syncInfo.status === 'error'
              ? getNextRetryTime(errorCount, config)
              : undefined,
        })
      }

      return {
        ...currentState,
        wallets: newWallets,
        lastSyncTime: Date.now(),
        // Disable fast polling if UTXO changed
        ...(utxoChanged
          ? {
              isFastPolling: false,
              lastUtxoCountBeforeSync: undefined,
            }
          : {}),
      }
    })

    // Update sync wallet infos observable
    updateSyncWalletInfos((infos) => {
      const newInfos = new Map(infos)
      for (const [walletId, syncInfo] of syncInfos.entries()) {
        newInfos.set(walletId, syncInfo)
      }
      return newInfos
    })
  }

  // Get current polling interval based on fast polling state
  const getCurrentInterval = (): number => {
    const state = syncState$.value
    if (state.isFastPolling && state.lastTxSubmissionTime) {
      const timeSinceTx = Date.now() - state.lastTxSubmissionTime
      if (timeSinceTx < config.fastIntervalDuration) {
        return config.fastInterval
      }
      // Switch back to normal interval
      updateSyncState((s) => ({
        ...s,
        isFastPolling: false,
        lastUtxoCountBeforeSync: undefined,
      }))
    }
    return config.normalInterval
  }

  // Start syncing
  const start = () => {
    if (syncSubscription) {
      return // Already started
    }

    updateSyncState((state) => ({
      ...state,
      isActive: true,
    }))

    // Create sync stream
    const syncStream = merge(
      // Adaptive polling-based sync
      combineLatest([interval(config.normalInterval), syncState$]).pipe(
        switchMap(([_, state]) => {
          if (!state.isActive) {
            return of(null)
          }

          const currentInterval = getCurrentInterval()
          return timer(0, currentInterval).pipe(
            switchMap(() => from(performSync(false))),
            catchError((error) => {
              logger.error('syncManager: Polling sync error', {error})
              return of(null)
            }),
          )
        }),
      ),
      // Immediate sync trigger after transaction submission
      txSubmitted$.pipe(
        switchMap((event) => {
          logger.debug(
            'syncManager: Transaction submitted, triggering fast sync',
            {
              walletId: event.walletId,
              txId: event.txId,
            },
          )

          // Trigger immediate sync for the wallet that submitted transaction
          const wallet = currentWallets.find((w) => w.id === event.walletId)
          if (!wallet) {
            return of(null)
          }

          // Store UTXO count before sync
          const utxoCountBeforeSync = wallet.utxos.length

          // Update state to enable fast polling
          updateSyncState((state) => ({
            ...state,
            lastTxSubmissionTime: event.timestamp,
            lastTxSubmissionWalletId: event.walletId,
            lastUtxoCountBeforeSync: utxoCountBeforeSync,
            isFastPolling: true,
          }))

          // Get tip status for immediate sync (use cache if available)
          const currentState = syncState$.value
          const baseApiUrl = wallet.networkManager.legacyApiBaseUrl

          return from(
            getTipStatusForNetwork(currentState.currentNetwork, baseApiUrl),
          ).pipe(
            switchMap((tipStatus) =>
              from(
                syncWalletsParallel(
                  [wallet],
                  config,
                  syncState$.value,
                  false,
                  tipStatus,
                ),
              ),
            ),
            switchMap((syncInfos) => {
              // Get current state after sync
              const currentStateAfterSync = syncState$.value

              // Re-find wallet from current wallets to ensure we have latest reference
              const walletAfterSync = currentWallets.find(
                (w) => w.id === event.walletId,
              )

              // Check for UTXO changes
              let utxoChanged = false
              if (
                walletAfterSync &&
                currentStateAfterSync.lastUtxoCountBeforeSync !== undefined
              ) {
                const currentUtxoCount = walletAfterSync.utxos.length
                if (
                  currentUtxoCount !==
                  currentStateAfterSync.lastUtxoCountBeforeSync
                ) {
                  utxoChanged = true
                  logger.debug(
                    'syncManager: UTXO change detected after immediate sync, switching to normal polling',
                    {
                      walletId: event.walletId,
                      oldCount: currentStateAfterSync.lastUtxoCountBeforeSync,
                      newCount: currentUtxoCount,
                    },
                  )
                }
              }

              // Update state with sync results
              updateSyncState((currentState) => {
                const newWallets = new Map(currentState.wallets)
                for (const [walletId, syncInfo] of syncInfos.entries()) {
                  const walletState = newWallets.get(walletId)
                  if (walletState) {
                    newWallets.set(walletId, {
                      ...walletState,
                      info: syncInfo,
                      lastSyncTime: Date.now(),
                      errorCount:
                        syncInfo.status === 'error'
                          ? walletState.errorCount + 1
                          : 0,
                    })
                  }
                }
                return {
                  ...currentState,
                  wallets: newWallets,
                  lastSyncTime: Date.now(),
                  // Disable fast polling if UTXO changed
                  ...(utxoChanged
                    ? {
                        isFastPolling: false,
                        lastUtxoCountBeforeSync: undefined,
                      }
                    : {}),
                }
              })

              updateSyncWalletInfos((infos) => {
                const newInfos = new Map(infos)
                for (const [walletId, syncInfo] of syncInfos.entries()) {
                  newInfos.set(walletId, syncInfo)
                }
                return newInfos
              })

              return of(null)
            }),
            catchError((error) => {
              logger.error('syncManager: Transaction sync error', {error})
              return of(null)
            }),
          )
        }),
      ),
    )

    syncSubscription = syncStream.subscribe()

    // Perform initial sync
    performSync(false).catch((error) => {
      logger.error('syncManager: Initial sync error', {error})
    })
  }

  // Stop syncing
  const stop = () => {
    syncSubscription?.unsubscribe()
    syncSubscription = null

    updateSyncState((state) => ({
      ...state,
      isActive: false,
    }))
  }

  // Pause syncing
  const pause = () => {
    updateSyncState((state) => ({
      ...state,
      isActive: false,
    }))
  }

  // Resume syncing
  const resume = () => {
    updateSyncState((state) => ({
      ...state,
      isActive: true,
    }))
  }

  // Trigger immediate sync for specific wallet
  const triggerSync = async (walletId: YoroiWallet['id']) => {
    const wallet = currentWallets.find((w) => w.id === walletId)
    if (!wallet) {
      logger.warn('syncManager: Wallet not found for sync trigger', {walletId})
      return
    }

    // Get tip status for triggered sync
    const currentState = syncState$.value
    const baseApiUrl = wallet.networkManager.legacyApiBaseUrl
    const tipStatus = await getTipStatusForNetwork(
      currentState.currentNetwork,
      baseApiUrl,
    )

    syncWalletsParallel([wallet], config, syncState$.value, true, tipStatus)
      .then((syncInfos) => {
        updateSyncState((currentState) => {
          const newWallets = new Map(currentState.wallets)
          for (const [id, syncInfo] of syncInfos.entries()) {
            const walletState = newWallets.get(id)
            if (walletState) {
              newWallets.set(id, {
                ...walletState,
                info: syncInfo,
                lastSyncTime: Date.now(),
                errorCount:
                  syncInfo.status === 'error' ? walletState.errorCount + 1 : 0,
              })
            }
          }
          return {
            ...currentState,
            wallets: newWallets,
            lastSyncTime: Date.now(),
          }
        })

        updateSyncWalletInfos((infos) => {
          const newInfos = new Map(infos)
          for (const [id, syncInfo] of syncInfos.entries()) {
            newInfos.set(id, syncInfo)
          }
          return newInfos
        })
      })
      .catch((error) => {
        logger.error('syncManager: Trigger sync error', {walletId, error})
      })
  }

  // Update wallets list
  const updateWallets = (wallets: YoroiWallet[]) => {
    currentWallets = wallets
    internalWallets$.next(wallets)
  }

  // Update selected network
  const updateNetwork = (network: Chain.SupportedNetworks) => {
    updateSyncState((state) => ({
      ...state,
      currentNetwork: network,
    }))
  }

  // Notify transaction submission
  const notifyTransactionSubmitted = (event: TransactionSubmittedEvent) => {
    txSubmitted$.next(event)
  }

  return {
    syncState$: syncState$.asObservable(),
    syncWalletInfos$: syncWalletInfos$.asObservable(),
    start,
    stop,
    pause,
    resume,
    triggerSync,
    updateWallets,
    updateNetwork,
    notifyTransactionSubmitted,
  }
}
