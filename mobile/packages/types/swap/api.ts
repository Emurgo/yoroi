import {ApiResponse} from '../api/response'
import {PortfolioTokenInfo} from '../portfolio/info'
import {PortfolioTokenId} from '../portfolio/token'
import {SwapAggregator} from './aggregator'
import {SwapOrder} from './order'
import {SwapProtocol} from './protocol'

export type SwapLimitOptionsRequest = {
  tokenIn: PortfolioTokenId
  tokenOut: PortfolioTokenId
}

export type SwapLimitOptionsResponse = {
  defaultProtocol: SwapProtocol
  wantedPrice: number
  options: Array<{
    protocol: SwapProtocol
    initialPrice: number
    batcherFee: number
  }>
}

export type SwapEstimateRequest = {
  slippage: number // unused for limit, but can't figure out how to combine the type with the below amountOut spec. Harmless since client does have the value
  tokenIn: PortfolioTokenId
  tokenOut: PortfolioTokenId
  protocol?: SwapProtocol
  blockedProtocols?: Array<SwapProtocol>
} & (
  | {
      amountOut?: undefined
      amountIn: number
      multiples?: number
      wantedPrice?: number
    }
  | {
      amountOut: number
      amountIn?: undefined
      multiples?: undefined
      wantedPrice?: undefined
    }
)

export type SwapSplit = {
  amountIn: number
  batcherFee: number
  deposits: number
  protocol: SwapProtocol
  expectedOutput: number
  expectedOutputWithoutSlippage: number
  fee: number
  finalPrice: number
  initialPrice: number
  poolFee: number
  poolId: string
  priceDistortion: number
  priceImpact: number
}

export type SwapEstimateResponse = {
  splits: Array<SwapSplit>
  batcherFee: number
  deposits: number
  aggregatorFee: number
  frontendFee: number
  netPrice: number
  priceImpact: number
  totalFee: number
  totalOutput: number
  totalOutputWithoutSlippage?: number
  totalInput?: number
}

export type SwapCreateRequest = {
  amountIn: number
  tokenIn: PortfolioTokenId
  tokenOut: PortfolioTokenId
  protocol?: SwapProtocol
  inputs?: Array<string>
  blockedProtocols?: Array<SwapProtocol>
} & (
  | {
      wantedPrice?: number
      slippage?: undefined
      multiples?: number
    }
  | {
      wantedPrice?: undefined
      slippage: number
      multiples?: undefined
    }
)

export type SwapCreateResponse = {
  splits: SwapSplit[]
  batcherFee: number
  deposits: number
  aggregatorFee: number
  frontendFee: number
  netPrice?: number
  priceImpact: number
  totalFee: number
  totalInput: number
  totalOutput: number
  totalOutputWithoutSlippage?: number
  aggregator: SwapAggregator
  cbor: string
}

export type SwapCancelRequest = {
  order: SwapOrder
}

export type SwapCancelResponse = {
  cbor: string
  additionalCancellationFee?: number
}

export type SwapApi = Readonly<{
  orders: () => Promise<ApiResponse<Array<SwapOrder>>>
  tokens: () => Promise<ApiResponse<Array<PortfolioTokenInfo>>>
  limitOptions(
    args: Readonly<SwapLimitOptionsRequest>,
  ): Promise<ApiResponse<SwapLimitOptionsResponse>>
  estimate(
    args: Readonly<SwapEstimateRequest>,
  ): Promise<ApiResponse<SwapEstimateResponse>>
  create(
    args: Readonly<SwapCreateRequest>,
  ): Promise<ApiResponse<SwapCreateResponse>>
  cancel: (
    args: Readonly<SwapCancelRequest>,
  ) => Promise<ApiResponse<SwapCancelResponse>>
}>
