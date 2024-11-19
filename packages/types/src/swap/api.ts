import {ApiResponse} from '../api/response'
import {PortfolioTokenInfo} from '../portfolio/info'
import {PortfolioTokenId} from '../portfolio/token'

export const SwapAggregator = {
  Muesliswap: 'muesliswap',
  Dexhunter: 'dexhunter',
} as const
export type SwapAggregator =
  (typeof SwapAggregator)[keyof typeof SwapAggregator]

export type SwapOrder = {
  aggregator: SwapAggregator
  dex: string
  placedAt?: number
  lastUpdate?: number
  status: string
  tokenIn: PortfolioTokenId
  tokenOut: PortfolioTokenId
  amountIn: number
  actualAmountOut: number
  expectedAmountOut: number
  txHash?: string
  outputIndex?: number
  updateTxHash?: string
  customId?: string
}

export type SwapEstimateRequest = {
  slippage: number
  tokenIn: PortfolioTokenId
  tokenOut: PortfolioTokenId
  dex?: string
  blacklistedDexes?: string[]
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
  dex: string
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
  splits: SwapSplit[]
  batcherFee: number
  deposits: number
  aggregatorFee: number
  frontendFee: number
  netPrice: number
  totalFee: number
  totalOutput: number
  totalOutputWithoutSlippage?: number
  totalInput?: number
}

export type SwapCreateRequest = {
  amountIn: number
  tokenIn: PortfolioTokenId
  tokenOut: PortfolioTokenId
  dex?: string
  blacklistedDexes?: string[]
} & (
  | {
      multiples?: number
      wantedPrice?: number
      slippage?: undefined
    }
  | {
      slippage: number
      wantedPrice?: undefined
      multiples?: undefined
    }
)

// Leaks aggregator because of current challenge creating a cbor inside package
export type SwapCreateResponse = {
  splits: SwapSplit[]
  batcherFee: number
  deposits: number
  aggregatorFee: number
  frontendFee: number
  netPrice?: number
  totalFee: number
  totalInput: number
  totalOutput: number
  totalOutputWithoutSlippage?: number
} & (
  | {
      aggregator: typeof SwapAggregator.Muesliswap
      datumData: string
      datumHash: string
      contractAddress: string
      cbor?: undefined
    }
  | {
      aggregator: typeof SwapAggregator.Dexhunter
      datumData?: undefined
      datumHash?: undefined
      contractAddress?: undefined
      cbor: string
    }
)

export type SwapCancelRequest = {
  order: SwapOrder
  collateral?: string
}

export type SwapCancelResponse = {
  cbor: string
  additionalCancellationFee?: number
}
export type SwapApi = Readonly<{
  orders: () => Promise<Readonly<ApiResponse<Array<SwapOrder>>>>
  tokens: () => Promise<Readonly<ApiResponse<Array<PortfolioTokenInfo>>>>
  estimate(
    args: SwapEstimateRequest,
  ): Promise<Readonly<ApiResponse<SwapEstimateResponse>>>
  create(
    args: SwapCreateRequest,
  ): Promise<Readonly<ApiResponse<SwapCreateResponse>>>
  cancel: (
    args: SwapCancelRequest,
  ) => Promise<Readonly<ApiResponse<SwapCancelResponse>>>
}>
