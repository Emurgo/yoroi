import {ImageSourcePropType} from 'react-native'
import {useQuery, UseQueryOptions} from 'react-query'

import AdaLogo from '../../../assets/img/ada.png'
import {getDappFallbackLogo} from '../../../features/Discover/common/helpers'

interface IAsset {
  logo: ImageSourcePropType | string
  symbol: string
  balance: string
}

export interface ILiquidityPool {
  usdExchangeRate: number
  assets: [IAsset, IAsset]
  dex: {
    logo: ImageSourcePropType | string
    name: string
  }
  id: number
}

const listLiquidityPool: ILiquidityPool[] = [
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

export const useGetLiquidityPool = (
  options: UseQueryOptions<ILiquidityPool[], Error, ILiquidityPool[], ['useGetLiquidityPool']> = {},
) => {
  const query = useQuery({
    useErrorBoundary: true,
    ...options,
    queryKey: ['useGetLiquidityPool'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 10000))
      return listLiquidityPool
    },
  })

  return query
}
