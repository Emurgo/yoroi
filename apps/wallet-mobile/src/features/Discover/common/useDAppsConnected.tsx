import {DappConnection, useDappConnector} from '@yoroi/dapp-connector'
import {useQuery, UseQueryOptions} from 'react-query'

import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'

export const useDAppsConnected = (
  options?: UseQueryOptions<DappConnection[], Error, string[], [string, string, string]>,
) => {
  const {wallet} = useSelectedWallet()
  const {manager} = useDappConnector()

  return useQuery({
    suspense: true,
    ...options,
    queryKey: [wallet.id, 'dappsConnected', String(wallet.networkManager.chainId)],
    queryFn: () => manager.listAllConnections(),
    select: (connections) => selectWalletConnectedOrigins(connections, wallet.id, wallet.networkManager.chainId),
  })
}

const selectWalletConnectedOrigins = (connections: DappConnection[], walletId: string, networkId: number) => {
  const currentWalletConnections = connections.filter((c) => c.walletId === walletId && c.networkId === networkId)
  return currentWalletConnections.map((c) => c.dappOrigin)
}
