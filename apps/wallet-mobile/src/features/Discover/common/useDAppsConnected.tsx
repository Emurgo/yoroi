import {useDappConnector} from '@yoroi/dapp-connector'
import {useQuery, UseQueryOptions} from 'react-query'

import {useSelectedWallet} from '../../../features/WalletManager/Context'

export const useDAppsConnected = (options?: UseQueryOptions<string[], Error, string[], [string, string]>) => {
  const wallet = useSelectedWallet()
  const {manager} = useDappConnector()

  return useQuery({
    suspense: true,
    ...options,
    queryKey: [wallet.id, 'dappsConnected'],
    queryFn: async () => {
      const connections = await manager.listAllConnections()
      const currentWalletConnections = connections.filter((c) => c.walletId === wallet.id)
      return currentWalletConnections.map((c) => c.dappOrigin)
    },
  })
}
