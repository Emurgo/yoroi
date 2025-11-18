import {time} from '@yoroi/common'

import * as React from 'react'

import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {YoroiWallet} from '~/wallets/cardano/types'

import {useWalletManager} from '../context/WalletManagerProvider'

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
}: {
  isGlobalSyncPaused: boolean
  walletId: YoroiWallet['id'] | null
  shouldNavigateAfterSync?: boolean
}) {
  const walletNavigation = useWalletNavigation()
  const {walletManager} = useWalletManager()

  React.useEffect(() => {
    let started = false
    if (!isGlobalSyncPaused || started || walletId == null) return

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
          logger.error(error)
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
          logger.debug(
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
          logger.error(error, {walletId, meta})
          if (shouldNavigateAfterSync) {
            walletNavigation.resetToWalletSelection()
          }
          return
        }

        // Do quick sync first to make wallet usable immediately
        await wallet.quickSync({isForced: true})

        // Navigate immediately after quick sync
        if (shouldNavigateAfterSync) {
          try {
            walletNavigation.resetToTxHistory()
          } catch (error) {
            logger.error(
              'useLaunchWalletAfterSyncing: Error navigating to tx history, trying wallet selection instead',
              {error, walletId},
            )
            // If navigation fails (e.g., user not logged in), fall back to wallet selection
            walletNavigation.resetToWalletSelection()
          }
        }

        // Start full sync in the background without waiting
        wallet.sync({isForced: true}).catch((error) => {
          logger.error(
            'useLaunchWalletAfterSyncing: Error during background full sync',
            {error, walletId},
          )
        })
      } catch (error) {
        logger.error(
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
