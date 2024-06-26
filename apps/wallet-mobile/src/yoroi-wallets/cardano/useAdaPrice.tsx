import {useQuery, UseQueryOptions} from '@tanstack/react-query'

import {time} from '../../kernel/constants'
import {queryInfo} from '../../kernel/query-client'
import {CurrencySymbol, PriceResponse} from '../types/other'
import fetchDefault from './api/fetch'

export const useAdaPrice = ({to, options}: {to: CurrencySymbol; options?: UseQueryOptions<Price, Error>}) => {
  const query = useQuery({
    staleTime: time.oneMinute,
    cacheTime: time.fiveMinutes,
    retryDelay: time.oneSecond,
    refetchInterval: time.oneMinute,
    queryKey: [queryInfo.keyToPersist, 'useRate', to],
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
    ...options,
  })

  if (query.data == null)
    return {
      price: 0,
      time: 0,
    }

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
