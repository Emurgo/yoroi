import {PortfolioTokenActivityRecord} from './activity'

export type PortfolioTokenHistory = Readonly<{
  prices: ReadonlyArray<PortfolioTokenActivityRecord>
}>

export const PortfolioTokenHistoryPeriod = {
  OneDay: '1d',
  OneWeek: '1w',
  OneMonth: '1m',
  SixMonth: '6m',
  OneYear: '1y',
  All: 'all',
} as const

export type PortfolioTokenHistoryPeriod =
  (typeof PortfolioTokenHistoryPeriod)[keyof typeof PortfolioTokenHistoryPeriod]
