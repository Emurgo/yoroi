import {useDappConnector} from '@yoroi/dapp-connector/src'
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
      return connections.map((c) => c.dappOrigin)
    },
  })
}
