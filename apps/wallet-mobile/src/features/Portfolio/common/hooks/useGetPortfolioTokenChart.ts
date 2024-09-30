import {isRight} from '@yoroi/common'
import {isPrimaryToken} from '@yoroi/portfolio'
import {Chain, Portfolio} from '@yoroi/types'
import {useQuery, UseQueryOptions} from '@tanstack/react-query'

import {supportedCurrencies, time} from '../../../../kernel/constants'
import {useLanguage} from '../../../../kernel/i18n'
import {logger} from '../../../../kernel/logger/logger'
import {fetchPtPriceActivity} from '../../../../yoroi-wallets/cardano/usePrimaryTokenActivity'
import {useCurrencyPairing} from '../../../Settings/Currency/CurrencyContext'
import {useSelectedNetwork} from '../../../WalletManager/common/hooks/useSelectedNetwork'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {networkConfigs} from '../../../WalletManager/network-manager/network-manager'
import {priceChange} from '../helpers/priceChange'
import {usePortfolioTokenDetailParams} from './useNavigateTo'

export const TOKEN_CHART_INTERVAL = {
  DAY: '24 H',
  WEEK: '1 W',
  MONTH: '1 M',
  SIX_MONTHS: '6 M',
  YEAR: '1 Y',
  ALL: 'ALL',
} as const

export type TokenChartInterval = (typeof TOKEN_CHART_INTERVAL)[keyof typeof TOKEN_CHART_INTERVAL]

type TokenChartData = {
  label: string
  value: number
  changePercent: number
  changeValue: number
}

const getTimestamps = (timeInterval: TokenChartInterval) => {
  const now = Date.now()
  const [from, resolution] = {
    [TOKEN_CHART_INTERVAL.DAY]: [now - time.oneDay, 96],
    [TOKEN_CHART_INTERVAL.WEEK]: [now - time.oneWeek, 168],
    [TOKEN_CHART_INTERVAL.MONTH]: [now - time.oneMonth, 180],
    [TOKEN_CHART_INTERVAL.SIX_MONTHS]: [now - time.sixMonths, 180],
    [TOKEN_CHART_INTERVAL.YEAR]: [now - time.oneYear, 365],
    [TOKEN_CHART_INTERVAL.ALL]: [new Date('2018').getTime(), 256],
  }[timeInterval]

  const step = (now - from) / resolution
  return Array.from({length: resolution}, (_, i) => from + Math.round(step * i))
}

const ptTicker = networkConfigs[Chain.Network.Mainnet].primaryTokenInfo.ticker

export const useGetPortfolioTokenChart = (
  timeInterval = TOKEN_CHART_INTERVAL.DAY as TokenChartInterval,
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

  const ptQuery = useQuery({
    staleTime: time.halfHour,
    cacheTime: time.oneHour,
    retryDelay: time.oneSecond,
    optimisticResults: true,
    refetchInterval: time.halfHour,
    useErrorBoundary: true,
    refetchOnMount: false,
    enabled: tokenInfo && isPrimaryToken(tokenInfo.info),
    ...options,
    queryKey: ['useGetPortfolioTokenChart', tokenInfo?.info.id ?? '', timeInterval, currency],
    queryFn: async () => {
      const response = await fetchPtPriceActivity(getTimestamps(timeInterval))
      if (isRight(response)) {
        if (response.value.data.error) throw new Error(response.value.data.error)

        const tickers = response.value.data.tickers
        if (tickers.length === 0) return null

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
      }
      logger.error('Failed to fetch token chart data for PT')
      return null
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
    [TOKEN_CHART_INTERVAL.DAY]: Portfolio.Token.HistoryPeriod.OneDay,
    [TOKEN_CHART_INTERVAL.WEEK]: Portfolio.Token.HistoryPeriod.OneWeek,
    [TOKEN_CHART_INTERVAL.MONTH]: Portfolio.Token.HistoryPeriod.OneMonth,
    [TOKEN_CHART_INTERVAL.SIX_MONTHS]: Portfolio.Token.HistoryPeriod.SixMonth,
    [TOKEN_CHART_INTERVAL.YEAR]: Portfolio.Token.HistoryPeriod.OneYear,
    [TOKEN_CHART_INTERVAL.ALL]: Portfolio.Token.HistoryPeriod.All,
  }[i] ?? Portfolio.Token.HistoryPeriod.OneDay)
