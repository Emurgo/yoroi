import {useQuery, UseQueryOptions} from 'react-query'

import {useSelectedWallet} from '../../../features/WalletManager/Context'
import {mockDAppList} from './DAppMock'

export const useDAppsConnected = (options?: UseQueryOptions<string[], Error, string[], [string, string]>) => {
  const wallet = useSelectedWallet()

  return useQuery({
    suspense: true,
    ...options,
    queryKey: [wallet.id, 'dappsConnected'],
    queryFn: async () => {
      return await new Promise<string[]>((resolve) => {
        return setTimeout(() => resolve(mockDAppList.slice(0, 3).map((_) => _.origins[0])), 1000)
      })
    },
  })
}
