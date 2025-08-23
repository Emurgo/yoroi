import {BalanceQuantity} from '../balance/token'
import {SwapAggregator} from '../swap/aggregator'

export interface AppApi {
  getFrontendFees(): Promise<AppFrontendFeesResponse>
}

export type AppFrontendFeesResponse = Readonly<{
  [aggregator in SwapAggregator]?: ReadonlyArray<AppFrontendFeeTier>
}>

export type AppFrontendFeeTier = Readonly<{
  primaryTokenValueThreshold: BalanceQuantity // primary token trade value threshold
  secondaryTokenBalanceThreshold: BalanceQuantity // secodary token balance (holding)
  variableFeeMultiplier: number
  fixedFee: BalanceQuantity
}>
