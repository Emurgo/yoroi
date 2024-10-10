import {BigNumber} from 'bignumber.js'

export type PortfolioTokenActivityRecord = Readonly<{
  ts: number // timestamp
  open: BigNumber // previous - BigNumber
  close: BigNumber // lastest - BigNumber
  high: BigNumber // highest - BigNumber
  low: BigNumber // lowest - BigNumber
  change: number // perc e.g -5% +10%
}>

export type PortfolioTokenActivity = Readonly<{
  price: PortfolioTokenActivityRecord
  // volume: PortfolioActivityRecord
}>

export enum PortfolioTokenActivityWindow {
  OneDay = '24h',
  OneWeek = '7d',
  OneMonth = '30d',
  OneYear = '1y',
  All = 'all',
}
