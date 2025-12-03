import {YoroiWallet} from '@yoroi/cardano-wallet/types'
import {useObservableValue} from '@yoroi/common'

import * as React from 'react'

import {SyncWalletInfo} from '../common/types'
import {useWalletManager} from '../context/WalletManagerProvider'

/**
 * Hook to get sync info for a specific wallet.
 * Uses useObservableValue for optimal performance (no double renders).
 *
 * @param walletId - The wallet ID to get sync info for
 * @returns The sync info for the wallet, or undefined if not available
 */
export const useSyncWalletInfo = (walletId: YoroiWallet['id']) => {
  const {walletManager} = useWalletManager()

  const observable$ = React.useMemo(
    () => walletManager.syncWalletInfos$,
    [walletManager],
  )

  // Cache the last emitted value
  const lastValueRef = React.useRef<Map<YoroiWallet['id'], SyncWalletInfo>>(
    new Map(),
  )

  // Subscribe once to cache the latest value
  React.useEffect(() => {
    const subscription = walletManager.syncWalletInfos$.subscribe((value) => {
      lastValueRef.current = value
    })
    return () => subscription.unsubscribe()
  }, [walletManager])

  const getter = React.useCallback(() => {
    const syncWalletInfos = lastValueRef.current
    if (!syncWalletInfos || syncWalletInfos.size === 0) {
      return undefined
    }
    return syncWalletInfos.get(walletId)
  }, [walletId])

  return useObservableValue({
    observable$,
    getter,
  })
}
