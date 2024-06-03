import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {DappConnection, useDappConnector} from '@yoroi/dapp-connector'

import {useSelectedWallet} from '../../WalletManager/context/SelectedWalletContext'

export const useDAppsConnected = (options?: UseQueryOptions<DappConnection[], Error, string[], [string, string]>) => {
  const wallet = useSelectedWallet()
  const {manager} = useDappConnector()

  return useQuery({
    suspense: true,
    ...options,
    queryKey: [wallet.id, 'dappsConnected'],
    queryFn: () => manager.listAllConnections(),
    select: (connections) => {
      const currentWalletConnections = connections.filter((c) => c.walletId === wallet.id)
      return currentWalletConnections.map((c) => c.dappOrigin)
    },
  })
}
