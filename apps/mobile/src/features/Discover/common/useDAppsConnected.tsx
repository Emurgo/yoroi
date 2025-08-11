import {DappConnection, useDappConnector} from '@yoroi/dapp-connector'
import {Chain} from '@yoroi/types'
import * as React from 'react'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {usePromise} from '~/hooks/usePromise'

export const useDAppsConnected = (options?: {refetchOnMount?: boolean}) => {
  const {wallet} = useSelectedWallet()
  const {manager} = useDappConnector()

  const result = usePromise({
    promise: () => manager.listAllConnections(),
    shouldSuspend: true,
    ...options,
  })

  if (result.value) {
    return {
      data: selectWalletConnectedOrigins(
        result.value,
        wallet.id,
        wallet.networkManager.network,
      ),
      isLoading: result.isPending,
      error: result.error,
    }
  }

  return {
    data: [],
    isLoading: result.isPending,
    error: result.error,
  }
}

export const useInvalidateConnectedDapps = () => {
  // Since we're using usePromise instead of useQuery,
  // invalidation is handled differently - the component will re-render
  // and the promise will be re-executed when dependencies change
  return React.useCallback(async () => {
    // This is a no-op for usePromise - the component will re-render
    // and re-execute the promise when needed
  }, [])
}

const selectWalletConnectedOrigins = (
  connections: DappConnection[],
  walletId: string,
  network: Chain.Network,
) => {
  const currentWalletConnections = connections.filter(
    (c) => c.walletId === walletId && c.network === network,
  )
  return currentWalletConnections.map((c) => c.dappOrigin)
}
