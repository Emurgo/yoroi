import * as React from 'react'

import {useWalletManager} from '../context/WalletManagerContext'

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
  const manager = useWalletManager()
  const [isSyncTemporarilyPaused, setIsSyncTemporarilyPaused] = React.useState(
    !manager.isSyncActive && !manager.isSyncing,
  )

  React.useEffect(() => {
    manager.pauseSyncing()

    const subSyncActivity = manager.syncActive$.subscribe((isActive) => {
      setIsSyncTemporarilyPaused(() => !isActive && !manager.isSyncing)
    })
    const subIsSyncing = manager.syncing$.subscribe((isSyncing) => {
      setIsSyncTemporarilyPaused(() => !isSyncing)
    })

    return () => {
      subSyncActivity.unsubscribe()
      subIsSyncing.unsubscribe()

      manager.resumeSyncing()
    }
  }, [manager])

  return isSyncTemporarilyPaused
}
