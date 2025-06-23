import {networkConfigs} from '@yoroi/blockchains'
import {fetchData, isRight, time} from '@yoroi/common'
import {Chain, Portfolio} from '@yoroi/types'

import {useQuery, UseQueryOptions} from '@tanstack/react-query'

import {persistPrefixKeyword} from '../../../kernel/connection/ConnectionProvider'

export const usePrimaryTokenActivity = ({
  to,
  options,
}: {
  to: Portfolio.Currency.Symbol
  options?: UseQueryOptions<PrimaryTokenActivity, Error>
}) => {
  const query = useQuery({
    enabled: to !== ptTicker,
    staleTime: time.oneMinute,
    retryDelay: time.oneSecond,
    refetchInterval: time.oneMinute,
    queryKey: [persistPrefixKeyword, 'usePrimaryTokenActivity', to],
    ...options,
    queryFn: async () => {
      const response = await fetchPtPriceActivity([
        Date.now(),
        Date.now() - time.oneDay,
      ])

      if (isRight(response)) {
        // NOTE: transformer
        const tickers = response.value.data.tickers
        const ts = tickers[0]?.timestamp ?? 0
        const close = tickers[0]?.prices[to] ?? 0
        const open = tickers[1]?.prices[to] ?? 0
        return {
          ts,
          close,
          open,
        }
      }

      return defaultPrimaryTokenActivity
    },
  })

  if (query.data) return {ptActivity: query.data, isLoading: query.isLoading}

  return {ptActivity: defaultPrimaryTokenActivity, isLoading: query.isLoading}
}

export type PriceMultipleResponse = {
  error: string | null
  tickers: Array<{
    from: 'ADA'
    timestamp: number
    signature: string
    prices: Record<Portfolio.Currency.Symbol, number>
  }>
}

// NOTE: this API should be moved inside portfolio token activity (support PT in the request)
// NOTE: price API is unique for all networks
const apiBaseUrl = networkConfigs[Chain.Network.Mainnet].legacyApiBaseUrl
const ptTicker = networkConfigs[Chain.Network.Mainnet].primaryTokenInfo.ticker

type PrimaryTokenActivity = {
  ts: number
  close: number
  open: number
}
const defaultPrimaryTokenActivity: PrimaryTokenActivity = {
  ts: 0,
  close: 0,
  open: 0,
}

export const fetchPtPriceActivity = (timestamps: Array<number>) =>
  fetchData<PriceMultipleResponse>({
    url: `${apiBaseUrl}/price/${ptTicker}/${timestamps.join()}`,
    method: 'get',
  })
