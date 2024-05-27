import {ImageSourcePropType} from 'react-native'
import {useQuery, UseQueryOptions} from 'react-query'

import AdaLogo from '../../../assets/img/ada.png'
import {getDappFallbackLogo} from '../../Discover/common/helpers'

interface IAsset {
  logo: ImageSourcePropType | string
  symbol: string
  balance: string
}

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
    assets: [
      {
        logo: AdaLogo,
        balance: '2418.02123',
        symbol: 'ADA',
      },
      {
        logo: AdaLogo,
        balance: '2418.02123',
        symbol: 'LVLC',
      },
    ],
  },
  {
    id: 2,
    dex: {
      logo: getDappFallbackLogo('https://minswap.org'),
      name: 'Minswap',
    },
    usdExchangeRate: 0.48,
    assets: [
      {
        logo: AdaLogo,
        balance: '2418.02123',
        symbol: 'ADA',
      },
      {
        logo: AdaLogo,
        balance: '2418.02123',
        symbol: 'LVLC',
      },
    ],
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
