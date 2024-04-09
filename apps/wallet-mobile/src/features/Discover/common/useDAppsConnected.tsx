import {useQuery, UseQueryOptions} from 'react-query'

import {useSelectedWallet} from '../../../SelectedWallet/Context/SelectedWalletContext'
import {IDAppItem, mockDAppList} from './DAppMock'

type DAppId = IDAppItem['id']

export const useDAppsConnected = (options?: UseQueryOptions<DAppId[], Error, DAppId[], [string, string]>) => {
  const wallet = useSelectedWallet()

  const query = useQuery({
    suspense: true,
    ...options,
    queryKey: [wallet.id, 'dappsConnected'],
    queryFn: async () => {
      const data = await new Promise<DAppId[]>((resolve) => {
        return setTimeout(() => resolve(mockDAppList.slice(0, 3).map((_) => _.id)), 1000)
      })

      return data
    },
  })

  return query
}
