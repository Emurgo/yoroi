import BigNumber from 'bignumber.js'

export type PortfolioTokenActivityRecord = Readonly<{
  ts: number // timestamp
  open: BigNumber
  close: BigNumber
  high: BigNumber
  low: BigNumber
  change: number // perc e.g -5% +10%
}>

export type PortfolioTokenActivity = Readonly<{
  price: PortfolioTokenActivityRecord
  // volume: PortfolioActivityRecord
}>

export const PortfolioTokenActivityWindow = {
  OneDay: '24h',
  OneWeek: '7d',
  OneMonth: '30d',
  OneYear: '1y',
  All: 'all',
} as const

export type PortfolioTokenActivityWindow =
  (typeof PortfolioTokenActivityWindow)[keyof typeof PortfolioTokenActivityWindow]
