import {DappConnection, useDappConnector} from '@yoroi/dapp-connector'
import {Chain} from '@yoroi/types'
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
    queryKey: [wallet.id, 'useDappsConnected', wallet.networkManager.network],
    queryFn: () => manager.listAllConnections(),
    select: (connections) => selectWalletConnectedOrigins(connections, wallet.id, wallet.networkManager.network),
  })
}

const selectWalletConnectedOrigins = (connections: DappConnection[], walletId: string, network: Chain.Network) => {
  const currentWalletConnections = connections.filter((c) => c.walletId === walletId && c.network === network)
  return currentWalletConnections.map((c) => c.dappOrigin)
}
