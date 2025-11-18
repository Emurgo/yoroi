import {PromiseAllLimited} from '@yoroi/common'
import {Chain} from '@yoroi/types'

import {logger} from '~/kernel/logger/logger'
import {YoroiWallet} from '~/wallets/cardano/types'
import {TipStatusResponse} from '~/wallets/types/other'

import {SyncWalletInfo} from '../common/types'
import {shouldRetrySync} from './backoff'
import {SyncConfig} from './sync-config'
import type {SyncManagerState} from './sync-state'

/**
 * Sync a single wallet
 */
export const syncWallet = async (
  wallet: YoroiWallet,
  isForced: boolean = false,
  tipStatus?: TipStatusResponse | null,
): Promise<SyncWalletInfo> => {
  const startTime = Date.now()

  try {
    logger.debug('syncWallet: Starting', {
      walletId: wallet.id,
      isForced,
      hasTipStatus: !!tipStatus,
      origin: 'SyncManager',
    })

    await wallet.sync({isForced, tipStatus})

    const syncInfo: SyncWalletInfo = {
      id: wallet.id,
      status: 'done',
      updatedAt: Date.now(),
      network: wallet.networkManager.network,
    }

    logger.debug('syncWallet: Completed', {
      walletId: wallet.id,
      duration: Date.now() - startTime,
      origin: 'SyncManager',
    })

    return syncInfo
  } catch (error) {
    logger.error('syncWallet: Error', {
      walletId: wallet.id,
      error,
      duration: Date.now() - startTime,
      origin: 'SyncManager',
    })

    return {
      id: wallet.id,
      status: 'error',
      error: error instanceof Error ? error : new Error(String(error)),
      updatedAt: Date.now(),
      network: wallet.networkManager.network,
    }
  }
}

/**
 * Sync multiple wallets in parallel with concurrency limit and optional staggering
 */
export const syncWalletsParallel = async (
  wallets: YoroiWallet[],
  config: SyncConfig,
  state: SyncManagerState,
  isForced: boolean = false,
  tipStatus?: TipStatusResponse | null,
): Promise<Map<YoroiWallet['id'], SyncWalletInfo>> => {
  // Filter wallets that should be synced (respecting backoff)
  const walletsToSync = wallets.filter((wallet) => {
    const walletState = state.wallets.get(wallet.id)
    if (!walletState) {
      return true // New wallet, sync it
    }

    if (isForced) {
      return true // Forced sync, ignore backoff
    }

    return shouldRetrySync(
      walletState.errorCount,
      walletState.nextRetryTime,
      config,
    )
  })

  if (walletsToSync.length === 0) {
    logger.debug('syncWalletsParallel: No wallets to sync', {
      totalWallets: wallets.length,
      origin: 'SyncManager',
    })
    return new Map()
  }

  logger.debug('syncWalletsParallel: Starting', {
    totalWallets: wallets.length,
    walletsToSync: walletsToSync.length,
    concurrencyLimit: config.concurrencyLimit,
    staggerSyncs: config.staggerSyncs,
    staggerDelay: config.staggerDelay,
    origin: 'SyncManager',
  })

  // Create sync tasks with optional staggering
  const syncTasks = walletsToSync.map((wallet, index) => {
    return async () => {
      // Stagger syncs: add delay based on wallet index
      if (config.staggerSyncs && index > 0) {
        const delay = index * config.staggerDelay
        logger.debug('syncWalletsParallel: Staggering sync', {
          walletId: wallet.id,
          delay,
          index,
          origin: 'SyncManager',
        })
        await new Promise<void>((resolve) => setTimeout(resolve, delay))
      }

      return syncWallet(wallet, isForced, tipStatus)
    }
  })

  // Execute with concurrency limit
  const results = await PromiseAllLimited(syncTasks, config.concurrencyLimit)

  // Convert to Map
  const syncInfos = new Map<YoroiWallet['id'], SyncWalletInfo>()
  for (const result of results) {
    syncInfos.set(result.id, result)
  }

  logger.debug('syncWalletsParallel: Completed', {
    synced: syncInfos.size,
    staggerSyncs: config.staggerSyncs,
    origin: 'SyncManager',
  })

  return syncInfos
}

/**
 * Prioritize wallets for sync
 * Returns wallets sorted by priority (last selected first, then by last sync time)
 */
export const prioritizeWallets = (
  wallets: YoroiWallet[],
  lastSelectedWalletId: YoroiWallet['id'] | null,
  state: SyncManagerState,
): YoroiWallet[] => {
  const sorted = [...wallets].sort((a, b) => {
    // Last selected wallet gets highest priority
    if (a.id === lastSelectedWalletId) return -1
    if (b.id === lastSelectedWalletId) return 1

    // Then sort by last sync time (oldest first)
    const aState = state.wallets.get(a.id)
    const bState = state.wallets.get(b.id)

    const aLastSync = aState?.lastSyncTime ?? 0
    const bLastSync = bState?.lastSyncTime ?? 0

    return aLastSync - bLastSync
  })

  return sorted
}

/**
 * Filter wallets by network
 */
export const filterWalletsByNetwork = (
  wallets: YoroiWallet[],
  network: Chain.SupportedNetworks,
): YoroiWallet[] => {
  return wallets.filter((wallet) => wallet.networkManager.network === network)
}
