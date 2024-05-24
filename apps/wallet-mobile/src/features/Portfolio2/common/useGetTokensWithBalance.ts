import {ImageSourcePropType} from 'react-native'
import {useQuery, UseQueryOptions} from 'react-query'

import AdaLogo from '../../../assets/img/ada.png'

export interface IPortfolioBalance {
  logo: ImageSourcePropType | string
  symbol: string
  name: string
  balance: string
  oldBalance: string
  usdExchangeRate: number
}

export const useGetTokensWithBalance = (
  options: UseQueryOptions<IPortfolioBalance[], Error, IPortfolioBalance[], ['useGetTokensWithBalance']> = {},
) => {
  const query = useQuery({
    useErrorBoundary: true,
    ...options,
    queryKey: ['useGetTokensWithBalance'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      return [
        {
          logo: AdaLogo,
          symbol: 'ADA',
          name: 'Cardano',
          balance: '2418.02123',
          oldBalance: '2412.01233',
          usdExchangeRate: 0.48,
        },
        {
          logo: AdaLogo,
          symbol: 'AGIX',
          name: 'Agix',
          balance: '180.02123',
          oldBalance: '110.02123',
          usdExchangeRate: 0.8,
        },
        {
          logo: AdaLogo,
          symbol: 'HOSKY',
          name: 'Hosky',
          balance: '180.5123',
          oldBalance: '184.5123',
          usdExchangeRate: 0.8,
        },
      ]
    },
  })

  return query
}
