import {fetchData, isRight} from '@yoroi/common'
import {Chain} from '@yoroi/types'
import {useQuery, UseQueryOptions} from 'react-query'

import {networkConfigs} from '../../features/WalletManager/network-manager/network-manager'
import {time} from '../../kernel/constants'
import {queryInfo} from '../../kernel/query-client'
import {CurrencySymbol, PriceMultipleResponse} from '../types/other'

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
  close: 1,
  open: 1,
}

export const usePrimaryTokenActivity = ({
  to,
  options,
}: {
  to: CurrencySymbol
  options?: UseQueryOptions<PrimaryTokenActivity, Error>
}) => {
  const query = useQuery({
    enabled: to !== ptTicker,
    staleTime: time.oneMinute,
    cacheTime: time.fiveMinutes,
    retryDelay: time.oneSecond,
    optimisticResults: true,
    refetchInterval: time.oneMinute,
    queryKey: [queryInfo.keyToPersist, 'usePrimaryTokenActivity', to],
    ...options,
    queryFn: async () => {
      const response = await fetchPtPriceActivity([Date.now(), Date.now() - time.oneDay])

      if (isRight(response)) {
        // NOTE: transformer
        const tickers = response.value.data.tickers
        const ts = tickers[0]?.timestamp ?? 0
        const close = tickers[0]?.prices[to] ?? 1
        const open = tickers[1]?.prices[to] ?? 1
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

export const fetchPtPriceActivity = (timestamps: Array<number>) =>
  fetchData<PriceMultipleResponse>({
    url: `${apiBaseUrl}/price/${ptTicker}/${timestamps.join()}`,
    method: 'get',
  })
