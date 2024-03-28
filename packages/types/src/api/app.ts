import {BalanceQuantity} from '../balance/token'
import {SwapAggregator} from '../swap/aggregator'

export interface AppApi {
  getFrontendFees(): Promise<AppFrontendFeesResponse>
  getSwapConfig(): Promise<AppSwapConfigResponse>
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

export type AppSwapConfigResponse = Readonly<{
  aggregators: {
    [aggregator in SwapAggregator]?: {
      isEnabled: boolean
      frontendFeeTiers: ReadonlyArray<AppFrontendFeeTier>
      discountTokenId: string
    }
  }
  liquidityProvidersEnabled: ReadonlyArray<string>
  isSwapEnabled: boolean
}>
