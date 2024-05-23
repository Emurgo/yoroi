import {useQuery, UseQueryOptions} from 'react-query'

export const TOKEN_CHART_TIME_INTERVAL = {
  HOUR: '24 H',
  WEEK: '1 W',
  MONTH: '1 M',
  SIX_MONTHS: '6 M',
  YEAR: '1 Y',
  ALL: 'ALL',
} as const

export type TokenChartTimeInterval = (typeof TOKEN_CHART_TIME_INTERVAL)[keyof typeof TOKEN_CHART_TIME_INTERVAL]

export interface ITokenChartData {
  label: string
  value: number
  changePercentage: number
  changeValue: number
}

function generateMockChartData(
  timeInterval: TokenChartTimeInterval = TOKEN_CHART_TIME_INTERVAL.HOUR,
): ITokenChartData[] {
  const dataPoints = 50
  const startValue = 100
  const volatility = 50

  const startDate = new Date('2024-02-02T15:09:00')

  function getTimeIncrement(interval: TokenChartTimeInterval): number {
    switch (interval) {
      case TOKEN_CHART_TIME_INTERVAL.HOUR:
        return 60 * 60 * 1000 // 1 hour
      case TOKEN_CHART_TIME_INTERVAL.WEEK:
        return 24 * 60 * 60 * 1000 // 1 day
      case TOKEN_CHART_TIME_INTERVAL.MONTH:
        return 30 * 24 * 60 * 60 * 1000 // 1 month (approximated as 30 days)
      case TOKEN_CHART_TIME_INTERVAL.SIX_MONTHS:
        return 6 * 30 * 24 * 60 * 60 * 1000 // 6 months
      case TOKEN_CHART_TIME_INTERVAL.YEAR:
        return 12 * 30 * 24 * 60 * 60 * 1000 // 1 year (approximated as 360 days)
      default:
        return 60 * 1000 // Default to 1 minute
    }
  }

  const increment = getTimeIncrement(timeInterval)
  const chartData: ITokenChartData[] = []

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
    const changePercentage = i === 0 ? 0 : (changeValue / previousValue) * 100

    chartData.push({
      label,
      value,
      changePercentage,
      changeValue,
    })

    previousValue = value // Update previousValue for the next iteration
  }

  return chartData
}

const useGetPortfolioTokenChart = (
  timeInterval = TOKEN_CHART_TIME_INTERVAL.HOUR as TokenChartTimeInterval,
  options: UseQueryOptions<
    ITokenChartData[],
    Error,
    ITokenChartData[],
    ['useGetPortfolioTokenChart', TokenChartTimeInterval]
  > = {},
) => {
  const query = useQuery({
    useErrorBoundary: true,
    ...options,
    queryKey: ['useGetPortfolioTokenChart', timeInterval],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return generateMockChartData(timeInterval)
    },
  })

  return query
}

export default useGetPortfolioTokenChart
