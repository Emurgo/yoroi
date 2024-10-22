import {isRight} from '@yoroi/common'
import {isPrimaryToken} from '@yoroi/portfolio'
import {Chain, Portfolio} from '@yoroi/types'
import {useQuery, UseQueryOptions} from 'react-query'

import {supportedCurrencies, time} from '../../../../kernel/constants'
import {useLanguage} from '../../../../kernel/i18n'
import {logger} from '../../../../kernel/logger/logger'
import {fetchPtPriceActivity} from '../../../../yoroi-wallets/cardano/usePrimaryTokenActivity'
import {delay} from '../../../../yoroi-wallets/utils/timeUtils'
import {useCurrencyPairing} from '../../../Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {useSelectedNetwork} from '../../../WalletManager/common/hooks/useSelectedNetwork'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {networkConfigs} from '../../../WalletManager/network-manager/network-manager'
import {priceChange} from '../helpers/priceChange'
import {usePortfolioTokenDetailParams} from './useNavigateTo'

export const TokenChartInterval = {
  DAY: '24 H',
  WEEK: '1 W',
  MONTH: '1 M',
  SIX_MONTHS: '6 M',
  YEAR: '1 Y',
  ALL: 'ALL',
} as const

export type TokenChartInterval = (typeof TokenChartInterval)[keyof typeof TokenChartInterval]

type TokenChartData = {
  label: string
  value: number
  changePercent: number
  changeValue: number
}

const getTimestamps = (timeInterval: TokenChartInterval) => {
  const now = Date.now()
  const [from, resolution] = {
    [TokenChartInterval.DAY]: [now - time.oneDay, 96],
    [TokenChartInterval.WEEK]: [now - time.oneWeek, 168],
    [TokenChartInterval.MONTH]: [now - time.oneMonth, 180],
    [TokenChartInterval.SIX_MONTHS]: [now - time.sixMonths, 180],
    [TokenChartInterval.YEAR]: [now - time.oneYear, 365],
    [TokenChartInterval.ALL]: [new Date('2018').getTime(), 256],
  }[timeInterval ?? TokenChartInterval.DAY]

  const step = (now - from) / resolution
  return Array.from({length: resolution}, (_, i) => from + Math.round(step * i))
}

const ptTicker = networkConfigs[Chain.Network.Mainnet].primaryTokenInfo.ticker

export const ptPriceQueryFn = async ({queryKey}: {queryKey: ['ptPriceHistory', TokenChartInterval]}) => {
  const response = await fetchPtPriceActivity(getTimestamps(queryKey[1]))
  if (isRight(response) && !response.value.data.error && response.value.data.tickers.length !== 0) {
    return response.value.data.tickers
  }
  throw new Error('Failed to fetch token chart data for PT')
}

export const useGetPortfolioTokenChart = (
  timeInterval = TokenChartInterval.DAY as TokenChartInterval,
  options: UseQueryOptions<
    TokenChartData[] | null,
    Error,
    TokenChartData[] | null,
    ['useGetPortfolioTokenChart', string, TokenChartInterval, ReturnType<typeof useCurrencyPairing>['currency']?]
  > = {},
) => {
  const {id: tokenId} = usePortfolioTokenDetailParams()
  const {
    wallet: {balances},
  } = useSelectedWallet()
  const {
    networkManager: {tokenManager},
  } = useSelectedNetwork()
  const tokenInfo = balances.records.get(tokenId)
  const {currency} = useCurrencyPairing()
  const {languageCode} = useLanguage()

  const ptPriceQuery = useQuery<
    Awaited<ReturnType<typeof ptPriceQueryFn>>,
    Error,
    Awaited<ReturnType<typeof ptPriceQueryFn>>,
    ['ptPriceHistory', TokenChartInterval]
  >({
    enabled: tokenInfo && isPrimaryToken(tokenInfo.info),
    staleTime: time.halfHour,
    cacheTime: time.oneHour,
    refetchInterval: time.halfHour,
    queryKey: ['ptPriceHistory', timeInterval],
    queryFn: ptPriceQueryFn,
  })

  const ptQuery = useQuery({
    enabled: tokenInfo && isPrimaryToken(tokenInfo.info),
    staleTime: time.oneMinute,
    ...options,
    queryKey: ['useGetPortfolioTokenChart', 'pt', timeInterval, currency],
    queryFn: async () => {
      // force queryFn to be async, otherwise it takes longer and doesn't show isFetching
      await delay(0)

      const tickers = ptPriceQuery?.data ?? []
      if (tickers.length === 0) throw new Error('No PT price data')

      const validCurrency = currency === ptTicker ? supportedCurrencies.USD : currency ?? supportedCurrencies.USD

      const initialPrice = tickers[0].prices[validCurrency]
      const records = tickers
        .map((ticker) => {
          const value = ticker.prices[validCurrency]
          if (value === undefined) return undefined
          const {changePercent, changeValue} = priceChange(initialPrice, value)
          const label = new Date(ticker.timestamp).toLocaleString(languageCode, {
            dateStyle: 'short',
            timeStyle: 'short',
          })
          return {label, value, changePercent, changeValue}
        })
        .filter(Boolean) as TokenChartData[]

      return records
    },
  })

  const otherQuery = useQuery({
    useErrorBoundary: true,
    refetchOnMount: false,
    enabled: tokenInfo && !isPrimaryToken(tokenInfo.info),
    ...options,
    queryKey: ['useGetPortfolioTokenChart', tokenInfo?.info.id ?? '', timeInterval],
    queryFn: async () => {
      const response = await tokenManager.api.tokenHistory(tokenId, chartIntervalToHistoryPeriod(timeInterval))
      if (isRight(response)) {
        const prices = response.value.data.prices

        if (prices.length === 0) return null

        const initialPrice = prices[0].open.toNumber()
        const records = prices
          .map((price) => {
            const value = price.close.toNumber()
            if (value === undefined) return undefined
            const {changePercent, changeValue} = priceChange(initialPrice, value)
            const label = new Date(price.ts).toLocaleString(languageCode, {
              dateStyle: 'short',
              timeStyle: 'short',
            })
            return {label, value, changePercent, changeValue}
          })
          .filter(Boolean) as TokenChartData[]

        return records
      }
      logger.error(`Failed to fetch token chart data for ${tokenId}`)
      return null
    },
  })

  return tokenInfo && isPrimaryToken(tokenInfo.info) ? ptQuery : otherQuery
}

const chartIntervalToHistoryPeriod = (i: TokenChartInterval): Portfolio.Token.HistoryPeriod =>
  ({
    [TokenChartInterval.DAY]: Portfolio.Token.HistoryPeriod.OneDay,
    [TokenChartInterval.WEEK]: Portfolio.Token.HistoryPeriod.OneWeek,
    [TokenChartInterval.MONTH]: Portfolio.Token.HistoryPeriod.OneMonth,
    [TokenChartInterval.SIX_MONTHS]: Portfolio.Token.HistoryPeriod.SixMonth,
    [TokenChartInterval.YEAR]: Portfolio.Token.HistoryPeriod.OneYear,
    [TokenChartInterval.ALL]: Portfolio.Token.HistoryPeriod.All,
  }[i] ?? Portfolio.Token.HistoryPeriod.OneDay)
