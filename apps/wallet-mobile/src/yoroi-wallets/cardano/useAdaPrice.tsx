import {App} from '@yoroi/types'
import {useQuery, UseQueryOptions} from 'react-query'

import {time} from '../../kernel/constants'
import {queryInfo} from '../../kernel/query-client'
import {CurrencySymbol, PriceResponse} from '../types/other'
import fetchDefault from './api/fetch'

export const useAdaPrice = ({to, options}: {to: CurrencySymbol; options?: UseQueryOptions<Price, Error>}) => {
  const query = useQuery({
    suspense: true,
    staleTime: time.oneMinute,
    cacheTime: time.fiveMinutes,
    retryDelay: time.oneSecond,
    optimisticResults: true,
    refetchInterval: time.oneMinute,
    queryKey: [queryInfo.keyToPersist, 'useRate', to],
    ...options,
    queryFn: async () => {
      if (to === 'ADA')
        return {
          price: 1,
          time: Date.now(),
        }
      const price = await fetchCurrentPrice(legacyBaseUrl)(to)
      return {
        price,
        time: Date.now(),
      }
    },
  })

  if (query.data == null) throw new App.Errors.InvalidState('useAdaPrice: invalid state')

  return query.data
}

const fetchCurrentPrice =
  (legacyBaseUrl: string) =>
  async (currency: CurrencySymbol): Promise<number> => {
    const response = (await fetchDefault('price/ADA/current', null, legacyBaseUrl, 'GET')) as unknown as PriceResponse

    return response.ticker.prices[currency]
  }

const legacyBaseUrl = 'https://api.yoroiwallet.com/api'

type Price = {
  price: number
  time: number
}
