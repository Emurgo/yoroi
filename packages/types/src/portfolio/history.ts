import {PortfolioTokenActivityRecord} from './activity'

export type PortfolioTokenHistory = Readonly<{
  prices: ReadonlyArray<PortfolioTokenActivityRecord>
}>

export enum PortfolioTokenHistoryPeriod {
  OneDay = '1d',
  OneWeek = '1w',
  OneMonth = '1m',
  SixMonth = '6m',
  OneYear = '1y',
  All = 'all',
}
