import {BigNumber} from 'bignumber.js'

export type PortfolioTokenActivityRecord = Readonly<{
  ts: number // timestamp
  open: BigNumber // previous - BigNumber
  close: BigNumber // lastest - BigNumber
  change: number // perc e.g -5% +10%
}>

export type PortfolioTokenActivityUpdates = Readonly<{
  price24h: PortfolioTokenActivityRecord
  // volume24h: PortfolioActivityRecord
}>
