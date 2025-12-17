import {YoroiWallet} from '@yoroi/cardano-wallet'
import {time} from '@yoroi/common'
import {getLogger} from '@yoroi/logger'

import * as React from 'react'

import {useWalletManagerSelector} from '../context/WalletManagerProvider'

/**
 * Wallet navigation functions - should be provided by the app
 */
export type WalletNavigation = {
  resetToWalletSelection: () => void
  resetToTxHistory: () => void
}

/**
 * Custom hook to launch a new wallet first time or when a previous sync is required, it will follow these steps:
 * preconditions:
 * 1. wallet should be previously created
 * process:
 * 2. wait 1s to display any UI feedback (like a spinner)
 * 3. request pause of global sync
 * 4. open the wallets (to populate the wallets in the manager)
 * 5. check if the wallet provided is there (if not, silently redirect to wallet selection) (error is reported if user has enabled crash reporting)
 * 6. sync the wallet (with force flag)
 * 7. redirect user to the tx history screen (aka home screen)
 *
 * This **must be used only** to launch a wallet after it has been created/restore or in last case when it **requires** a sync
 * for every other case use wallet manager setCurrentWallet (setSelectedWallet and setSelectedWalletMeta will be deprecated)
 * check `SelectWalletFromList` useCase in the WalletManager feature for more details
 *
 * @param {YoroiWallet['id']} id - The ID of the wallet to launch
 * @summary This is for launching a wallet after it has been created/restore/required-sync **only**, don't use to select a wallet
 */
export function useLaunchWalletAfterSyncing({
  isGlobalSyncPaused = false,
  walletId,
  shouldNavigateAfterSync = true,
  walletNavigation,
}: {
  isGlobalSyncPaused: boolean
  walletId: YoroiWallet['id'] | null
  shouldNavigateAfterSync?: boolean
  /**
   * Navigation functions - should be provided by the app
   */
  walletNavigation: WalletNavigation
}) {
  // Use selector to prevent re-renders when selected wallet changes
  const walletManager = useWalletManagerSelector((ctx) => ctx.walletManager)

  React.useEffect(() => {
    let started = false
    if (!isGlobalSyncPaused || started || walletId == null || !walletManager)
      return

    const process = async () => {
      started = true
      try {
        // hydrate force manager to add wallets to the sync queue
        // it's ok if the wallet is already loaded by manager
        const {metas} = await walletManager.hydrate()

        const meta = metas.find(({id}) => id === walletId)
        if (!meta) {
          const error = new Error(
            'useLaunchWalletAfterSyncing: New wallet meta has not been found, reached an invalid state',
          )
          getLogger().error(error)
          if (shouldNavigateAfterSync) {
            walletNavigation.resetToWalletSelection()
          }
          return
        }

        // Set selected wallet ID first - this will trigger wallet loading
        walletManager.setSelectedWalletId(walletId)

        // Wait a bit for the wallet to be loaded
        // The wallet will be loaded asynchronously when setSelectedWalletId is called
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Try to get the wallet - it should be loaded now
        let wallet = walletManager.getWalletById(walletId)
        if (!wallet) {
          // If still not loaded, wait a bit more and try again
          getLogger().debug(
            'useLaunchWalletAfterSyncing: wallet not loaded yet, waiting...',
            {walletId},
          )
          await new Promise((resolve) => setTimeout(resolve, 1000))
          wallet = walletManager.getWalletById(walletId)
        }

        if (!wallet) {
          const error = new Error(
            'useLaunchWalletAfterSyncing: Wallet could not be loaded after setting selected wallet ID',
          )
          getLogger().error(error, {walletId, meta})
          if (shouldNavigateAfterSync) {
            walletNavigation.resetToWalletSelection()
          }
          return
        }

        // Do quick sync first to make wallet usable immediately
        await wallet.quickSync({isForced: true})

        // Wait a bit for balance to be calculated after quickSync
        // Balance calculation happens asynchronously after UTXO sync
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Check if balance is available (hydrated)
        // For new/empty wallets, balance might legitimately be zero, but we want to ensure
        // balance manager has been updated with the synced data
        let balanceCheckAttempts = 0
        const maxBalanceCheckAttempts = 5
        while (balanceCheckAttempts < maxBalanceCheckAttempts) {
          const balance = wallet.primaryBalance()
          // If balance manager is hydrated and has processed the sync, proceed
          // We check if balance info is available (not just quantity)
          if (balance && balance.info) {
            break
          }
          balanceCheckAttempts++
          await new Promise((resolve) => setTimeout(resolve, 300))
        }

        // Navigate after balance is available
        if (shouldNavigateAfterSync) {
          try {
            walletNavigation.resetToTxHistory()
          } catch (error) {
            getLogger().error(
              'useLaunchWalletAfterSyncing: Error navigating to tx history, trying wallet selection instead',
              {error, walletId},
            )
            // If navigation fails, fall back to wallet selection
            walletNavigation.resetToWalletSelection()
          }
        }

        // Start full sync in the background without waiting
        wallet.sync({isForced: true}).catch((error: unknown) => {
          getLogger().error(
            'useLaunchWalletAfterSyncing: Error during background full sync',
            {error, walletId},
          )
        })
      } catch (error) {
        getLogger().error(
          'useLaunchWalletAfterSyncing: Error during wallet launch',
          {error, walletId},
        )
        if (shouldNavigateAfterSync) {
          walletNavigation.resetToWalletSelection()
        }
      }
    }

    const timer = setTimeout(() => process(), time.oneSecond)
    return () => clearTimeout(timer)
  }, [
    isGlobalSyncPaused,
    walletId,
    walletNavigation,
    walletManager,
    shouldNavigateAfterSync,
  ])
}
