import {useQuery, UseQueryOptions} from 'react-query'

import {useSelectedWallet} from '../../../features/WalletManager/Context'
import {IDAppItem, mockDAppList} from './DAppMock'

export const useDAppsList = (options?: UseQueryOptions<IDAppItem[], Error, IDAppItem[], [string, string]>) => {
  const wallet = useSelectedWallet()

  const query = useQuery({
    suspense: true,
    ...options,
    queryKey: [wallet.id, 'dappsList'],
    queryFn: async () => {
      const data = await new Promise<IDAppItem[]>((resolve) => {
        return setTimeout(() => resolve(mockDAppList), 1000)
      })

      return data
    },
  })

  return query
}
