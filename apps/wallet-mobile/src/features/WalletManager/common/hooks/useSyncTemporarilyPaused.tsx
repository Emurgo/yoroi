import * as React from 'react'

import {useWalletManager} from '../../context/WalletManagerProvider'

/**
 * This is used to stop syncing and resume syncing automaticaly
 * (stop on mount and resume on unmount)
 * when there is an action that requires syncing to be stopped
 *
 * @summary This is for stopping syncing and resuming syncing automaticaly
 * when the screen is unmounted
 * @returns {boolean} isTemporarilyPaused - A boolean to indicate if syncing is stopped
 */
export function useSyncTemporarilyPaused() {
  const {walletManager} = useWalletManager()
  const [isSyncTemporarilyPaused, setIsSyncTemporarilyPaused] = React.useState(
    !walletManager.isSyncActive && !walletManager.isSyncing,
  )

  React.useEffect(() => {
    walletManager.pauseSyncing()

    const subSyncActivity = walletManager.syncActive$.subscribe((isActive) => {
      setIsSyncTemporarilyPaused(() => !isActive && !walletManager.isSyncing)
    })
    const subIsSyncing = walletManager.syncing$.subscribe((isSyncing) => {
      setIsSyncTemporarilyPaused(() => !isSyncing)
    })

    return () => {
      subSyncActivity.unsubscribe()
      subIsSyncing.unsubscribe()

      walletManager.resumeSyncing()
    }
  }, [walletManager])

  return isSyncTemporarilyPaused
}
