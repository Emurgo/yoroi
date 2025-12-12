import {DappConnection, useDappConnector} from '@yoroi/dapp-connector'
import {Chain} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {UseQueryOptions, useQuery, useQueryClient} from '@tanstack/react-query'
import * as React from 'react'

export const useDAppsConnected = (
  options?: UseQueryOptions<
    DappConnection[],
    Error,
    string[],
    [string, string, string]
  >,
) => {
  const {wallet} = useSelectedWallet()
  const {manager} = useDappConnector()

  return useQuery({
    throwOnError: true,
    ...options,
    queryKey: [wallet.id, 'useDappsConnected', wallet.networkManager.network],
    queryFn: () => manager.listAllConnections(),
    select: (connections) =>
      selectWalletConnectedOrigins(
        connections,
        wallet.id,
        wallet.networkManager.network,
      ),
  })
}

export const useInvalidateConnectedDapps = () => {
  const queryClient = useQueryClient()
  const selectedWallet = useSelectedWallet()
  const walletId = selectedWallet.wallet.id
  const network = selectedWallet.wallet.networkManager.network

  return React.useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [walletId, 'useDappsConnected', network],
    })
  }, [walletId, network, queryClient])
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
