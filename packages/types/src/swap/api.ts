import {ApiResponse} from '../api/response'
import {PortfolioTokenInfo} from '../portfolio/info'
import {PortfolioTokenId} from '../portfolio/token'

export const SwapAggregator = {
  Muesliswap: 'muesliswap',
  Dexhunter: 'dexhunter',
} as const
export type SwapAggregator =
  (typeof SwapAggregator)[keyof typeof SwapAggregator]

export const SwapProvider = {
  Minswap_v1: 'minswap-v1',
  Minswap_v2: 'minswap-v2',
  Muesliswap_v2: 'muesliswap-v2',
  Spectrum_v1: 'spectrum-v1',
  Sundaeswap_v1: 'sundaeswap-v1',
  Sundaeswap_v3: 'sundaeswap-v3',
  Teddy_v1: 'teddy-v1',
  Vyfi_v1: 'vyfi-v1',
  Wingriders_v1: 'wingriders-v1',
  Wingriders_v2: 'wingriders-v2',
  Splash_v1: 'splash-v1',
} as const

export type SwapProvider = (typeof SwapProvider)[keyof typeof SwapProvider]

export type SwapOrder = {
  aggregator: SwapAggregator
  dex: SwapProvider
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
  dex?: SwapProvider
  blacklistedDexes?: SwapProvider[]
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
  dex: SwapProvider
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
  dex?: SwapProvider
  blacklistedDexes?: SwapProvider[]
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
