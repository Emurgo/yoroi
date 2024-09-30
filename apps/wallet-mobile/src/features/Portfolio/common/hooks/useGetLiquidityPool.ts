import {Portfolio} from '@yoroi/types'
import {ImageSourcePropType} from 'react-native'
import {useQuery, UseQueryOptions} from '@tanstack/react-query'

import {getDappFallbackLogo} from '../../../Discover/common/helpers'

export type IAsset = Portfolio.Token.Amount
export interface ILiquidityPool {
  usdExchangeRate: number
  assets: [IAsset, IAsset]
  dex: {
    logo: ImageSourcePropType | string
    name: string
  }
  id: number
}

export const mockAmount = (symbol: string) =>
  ({
    info: {
      application: 'coin',
      decimals: 6,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
      fingerprint: 'asset155kudknt05ealtvcvsy7nw554g6wnc9dee3d',
      icon: '',
      id: symbol,
      mediaType: '',
      name: symbol,
      nature: 'primary',
      originalImage: '',
      reference: '',
      status: 'valid',
      symbol: '₳',
      tag: '',
      ticker: symbol,
      type: 'ft',
      website: 'https://www.cardano.org/',
    },
    quantity: BigInt(4800000),
  } as Portfolio.Token.Amount)

const listLiquidityPool: ILiquidityPool[] = [
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
    usdExchangeRate: 0.48,
    assets: [mockAmount('ADA'), mockAmount('HOSKY')],
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
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return listLiquidityPool
    },
  })

  return query
}
