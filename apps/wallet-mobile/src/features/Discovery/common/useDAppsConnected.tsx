import {useQuery, UseQueryOptions} from 'react-query'

import {useSelectedWallet} from '../../../SelectedWallet/Context/SelectedWalletContext'
import {IDAppItem, mockDAppList} from '../useCases/DiscoverList/DAppMock'

export const useDAppsConnected = (
  options?: UseQueryOptions<IDAppItem['id'][], Error, IDAppItem['id'][], [string, string]>,
) => {
  const wallet = useSelectedWallet()

  const query = useQuery({
    suspense: true,
    ...options,
    queryKey: [wallet.id, 'dappsConnected'],
    queryFn: async () => {
      const data = await new Promise((resolve) => {
        // return setTimeout(() => resolve([]), 1000)
        return setTimeout(() => resolve(mockDAppList.slice(0, 3).map((_) => _.id)), 1000)
      })

      return data as IDAppItem['id'][]
    },
  })

  return query
}
