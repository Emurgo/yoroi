import React from 'react'
import {useQuery, UseQueryOptions} from 'react-query'

import {time} from '../../kernel/constants'
import {queryInfo} from '../../kernel/query-client'
import {CurrencySymbol, PriceMultipleResponse} from '../types/other'
import fetchDefault from './api/fetch'
import {getCardanoNetworkConfigById} from './networks'

export const useAdaPrice = ({
  to,
  options,
}: {
  to: CurrencySymbol
  options?: UseQueryOptions<PriceMultipleResponse['tickers'], Error>
}) => {
  const {
    BACKEND: {API_ROOT},
  } = getCardanoNetworkConfigById(1) // Can't access wallet manager from here to know network, this API is fine for preprod

  const base = React.useMemo(
    () => ({
      time: 0,
      price: 1,
      previous: 1,
    }),
    [],
  )

  const query = useQuery({
    staleTime: time.oneMinute,
    cacheTime: time.fiveMinutes,
    retryDelay: time.oneSecond,
    optimisticResults: true,
    refetchInterval: time.oneMinute,
    queryKey: [queryInfo.keyToPersist, 'useRate'],
    ...options,
    queryFn: async () => {
      const {error, tickers} = await fetchAdaPrice(API_ROOT, [Date.now(), Date.now() - time.oneDay])
      if (error !== null) throw error
      return tickers
    },
  })

  if (to === 'ADA' || !query.data) return base

  const price = query.data[0].prices[to]
  const previous = query.data[1].prices[to]

  return {
    time: query.data[0].timestamp,
    price,
    previous,
  }
}

export const fetchAdaPrice = async (apiBaseUrl: string, timestamps: Array<number>): Promise<PriceMultipleResponse> => {
  return (await fetchDefault(
    `price/ADA/${timestamps.join()}`,
    null,
    apiBaseUrl,
    'GET',
  )) as unknown as PriceMultipleResponse
}
