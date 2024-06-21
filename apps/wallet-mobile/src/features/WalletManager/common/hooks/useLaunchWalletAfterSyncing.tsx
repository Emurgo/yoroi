import * as React from 'react'

import {time} from '../../../../kernel/constants'
import {logger} from '../../../../kernel/logger/logger'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useWalletManager} from '../../context/WalletManagerProvider'

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
}: {
  isGlobalSyncPaused: boolean
  walletId: YoroiWallet['id'] | null
}) {
  const walletNavigation = useWalletNavigation()
  const {walletManager} = useWalletManager()

  React.useEffect(() => {
    let started = false
    if (!isGlobalSyncPaused || started || walletId == null) return

    const process = async () => {
      started = true
      // hydrate force manager to add wallets to the sync queue
      // it's ok if the wallet is already loaded by manager
      const {metas} = await walletManager.hydrate()

      const wallet = walletManager.getWalletById(walletId)
      const meta = metas.find(({id}) => id === walletId)
      if (!wallet || !meta) {
        const error = new Error(
          'useLaunchWalletAfterSyncing: New wallet/meta has not been found, reached an invalid state',
        )
        logger.error(error)
        walletNavigation.resetToWalletSelection()
        return
      }

      walletManager.setSelectedWalletId(walletId)
      await wallet.sync({isForced: true})

      walletNavigation.resetToTxHistory()
    }

    const timer = setTimeout(() => process(), time.oneSecond)
    return () => clearTimeout(timer)
  }, [isGlobalSyncPaused, walletId, walletNavigation, walletManager])
}
