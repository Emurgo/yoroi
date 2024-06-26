import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {type Portfolio} from '@yoroi/types'
import {ImageSourcePropType} from 'react-native'

import AdaLogo from '../../../assets/img/ada.png'

interface IPortfolioTokenInfo {
  logo: ImageSourcePropType | string
  symbol: string
  name: string
  amount: Portfolio.Token.Amount
  info: typeof mockInfo
}

const mockAmount = {
  info: {
    application: 'coin',
    decimals: 6,
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    fingerprint: 'asset155kudknt05ealtvcvsy7nw554g6wnc9dee3d',
    icon: '',
    id: '.',
    mediaType: '',
    name: 'TADA',
    nature: 'primary',
    originalImage: '',
    reference: '',
    status: 'valid',
    symbol: '₳',
    tag: '',
    ticker: 'TADA',
    type: 'ft',
    website: 'https://www.cardano.org/',
  },
  quantity: BigInt(4800000),
} as Portfolio.Token.Amount

const mockInfo = {
  policyId: 'asset155kudknt05ealtvcvsy7nw554g6wnc9dee3d',
  performance: {
    user: {
      pnl: '0.51',
      invested: '27.79',
      bought: '100.00',
      receive: '100.51',
      sent: '100.51',
      sold: '0',
    },
    market: {
      change: '0,33',
      price: '0.48',
      cap: '557M',
      vol: '37M',
      rank: '55',
      circulating: '35,000,000,000',
      total_supply: '100,67T',
      max_supply: '400,67T',
      ath: '1,55',
      atl: '0,00002',
    },
  },
}

const MockTokenList = [
  {
    logo: AdaLogo,
    name: 'ADA',
    symbol: '₳',
    amount: mockAmount,
    info: mockInfo,
  },
  {
    logo: AdaLogo,
    name: 'TADA',
    symbol: '₳',
    amount: mockAmount,
    info: mockInfo,
  },
  {
    logo: AdaLogo,
    symbol: 'AGIX',
    name: 'AGIX',
    amount: mockAmount,
    info: mockInfo,
  },
  {
    logo: AdaLogo,
    symbol: 'HOSKY',
    name: 'HOSKY',
    amount: mockAmount,
    info: mockInfo,
  },
] as IPortfolioTokenInfo[]

export const useGetPortfolioTokenInfo = (
  name: string,
  options: UseQueryOptions<IPortfolioTokenInfo, Error, IPortfolioTokenInfo, ['useGetPortfolioTokenInfo', string]> = {},
) => {
  const query = useQuery({
    useErrorBoundary: true,
    ...options,
    refetchOnMount: false,
    queryKey: ['useGetPortfolioTokenInfo', name],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return MockTokenList.find((token) => token.name === name) ?? (MockTokenList[0] as IPortfolioTokenInfo)
    },
  })

  return query
}
