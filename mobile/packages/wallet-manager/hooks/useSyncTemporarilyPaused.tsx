import {useObservableValue} from '@yoroi/common'

import * as React from 'react'
import {merge} from 'rxjs'

import {useWalletManager} from '../context/WalletManagerProvider'

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

  // Merge both observables to trigger updates when either changes
  const observable$ = React.useMemo(
    () => merge(walletManager.syncActive$, walletManager.syncing$),
    [walletManager],
  )

  const getter = React.useCallback(() => {
    return !walletManager.isSyncActive && !walletManager.isSyncing
  }, [walletManager])

  // Side effects: pause on mount, resume on unmount
  React.useEffect(() => {
    walletManager.pauseSyncing()
    return () => {
      walletManager.resumeSyncing()
    }
  }, [walletManager])

  return useObservableValue({
    observable$,
    getter,
  })
}
