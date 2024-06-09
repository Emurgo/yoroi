import {ImageSourcePropType} from 'react-native'
import {useQuery, UseQueryOptions} from 'react-query'

import {getDappFallbackLogo} from '../../Discover/common/helpers'
import {IAsset, mockAmount} from './useGetLiquidityPool'

export interface IOpenOrders {
  usdExchangeRate: number
  assets: [IAsset, IAsset]
  dex: {
    logo: ImageSourcePropType | string
    name: string
  }
  id: number
}

const listOpenOrders: IOpenOrders[] = [
  {
    id: 1,
    dex: {
      logo: getDappFallbackLogo('https://minswap.org'),
      name: 'Minswap',
    },
    usdExchangeRate: 0.48,
    assets: [mockAmount('ADA'), mockAmount('LVLC')],
  },
  {
    id: 2,
    dex: {
      logo: getDappFallbackLogo('https://minswap.org'),
      name: 'Minswap',
    },
    usdExchangeRate: 0.42,
    assets: [mockAmount('ADA'), mockAmount('HOSKY')],
  },
]

export const useGetOpenOrders = (
  options: UseQueryOptions<IOpenOrders[], Error, IOpenOrders[], ['useGetOpenOrders']> = {},
) => {
  const query = useQuery({
    useErrorBoundary: true,
    ...options,
    queryKey: ['useGetOpenOrders'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return listOpenOrders
    },
  })

  return query
}
