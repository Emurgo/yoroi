import {isPrimaryToken} from '@yoroi/portfolio'
import {useQuery, UseQueryOptions} from 'react-query'

import {time} from '../../../kernel/constants'
import {getCardanoNetworkConfigById} from '../../../yoroi-wallets/cardano/networks'
import {fetchAdaPrice} from '../../../yoroi-wallets/cardano/useAdaPrice'
import {useCurrencyPairing} from '../../Settings/Currency'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {priceChange} from './helpers/priceChange'
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

function generateMockChartData(timeInterval: TokenChartInterval = TOKEN_CHART_INTERVAL.DAY): TokenChartData[] {
  const dataPoints = 50
  const startValue = 100
  const volatility = 50

  const startDate = new Date('2024-02-02T15:09:00')

  function getTimeIncrement(interval: TokenChartInterval): number {
    switch (interval) {
      case TOKEN_CHART_INTERVAL.DAY:
        return 60 * 60 * 1000 // 1 hour
      case TOKEN_CHART_INTERVAL.WEEK:
        return 24 * 60 * 60 * 1000 // 1 day
      case TOKEN_CHART_INTERVAL.MONTH:
        return 30 * 24 * 60 * 60 * 1000 // 1 month (approximated as 30 days)
      case TOKEN_CHART_INTERVAL.SIX_MONTHS:
        return 6 * 30 * 24 * 60 * 60 * 1000 // 6 months
      case TOKEN_CHART_INTERVAL.YEAR:
        return 12 * 30 * 24 * 60 * 60 * 1000 // 1 year (approximated as 360 days)
      default:
        return 60 * 1000 // Default to 1 minute
    }
  }

  const increment = getTimeIncrement(timeInterval)
  const chartData: TokenChartData[] = []

  let previousValue = startValue

  for (let i = 0; i < dataPoints; i++) {
    const date = new Date(startDate.getTime() + i * increment)
    const label = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getFullYear().toString().substr(-2)} ${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
    const value = i === 0 ? startValue : previousValue + (Math.random() - 0.5) * volatility
    const changeValue = i === 0 ? 0 : value - previousValue
    const changePercent = i === 0 ? 0 : (changeValue / previousValue) * 100

    chartData.push({
      label,
      value,
      changePercent,
      changeValue,
    })

    previousValue = value // Update previousValue for the next iteration
  }

  return chartData
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

const useGetPortfolioTokenChart = (
  timeInterval = TOKEN_CHART_INTERVAL.DAY as TokenChartInterval,
  options: UseQueryOptions<
    TokenChartData[],
    Error,
    TokenChartData[],
    ['useGetPortfolioTokenChart', string, TokenChartInterval, ReturnType<typeof useCurrencyPairing>['currency']?]
  > = {},
) => {
  const {id: tokenId} = usePortfolioTokenDetailParams()
  const {
    wallet: {balances},
  } = useSelectedWallet()
  const tokenInfo = balances.records.get(tokenId)
  const {currency} = useCurrencyPairing()
  const {
    BACKEND: {API_ROOT},
  } = getCardanoNetworkConfigById(1)

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
      const {error, tickers} = await fetchAdaPrice(API_ROOT, getTimestamps(timeInterval))
      if (error !== null) throw error

      const validCurrency = currency === 'ADA' ? 'USD' : currency ?? 'USD'

      const initialPrice = tickers[0].prices[validCurrency]
      const records = tickers
        .map((ticker) => {
          const value = ticker.prices[validCurrency]
          if (value === undefined) return undefined
          const {changePercent, changeValue} = priceChange(initialPrice, value)
          const label = new Date(ticker.timestamp).toLocaleString('en-us', {dateStyle: 'short', timeStyle: 'short'})
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
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return generateMockChartData(timeInterval)
    },
  })

  return tokenInfo && isPrimaryToken(tokenInfo.info) ? ptQuery : otherQuery
}

export default useGetPortfolioTokenChart
