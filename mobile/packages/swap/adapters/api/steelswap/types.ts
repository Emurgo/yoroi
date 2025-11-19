import {FetchData} from '@yoroi/common'
import {Chain, Portfolio} from '@yoroi/types'

export const Dex = {
  CSWAP: 'CSWAP',
  GeniusYield: 'GeniusYield',
  Minswap: 'Minswap',
  MinswapV2: 'MinswapV2',
  MinswapV2Router: 'MinswapV2Router',
  MuesliSwap: 'MuesliSwap',
  Spectrum: 'Spectrum',
  Splash: 'Splash',
  SplashRouter: 'SplashRouter',
  SundaeSwap: 'SundaeSwap',
  SundaeSwapV3: 'SundaeSwapV3',
  VyFi: 'VyFi',
  WingRiders: 'WingRiders',
  WingRidersV2: 'WingRidersV2',
  Unsupported: 'Unsupported',
} as const

export type Dex = (typeof Dex)[keyof typeof Dex]

export type Partners =
  | ''
  | 'eternl-aggregator'
  | 'eternl-browser'
  | 'farmbot'
  | 'lace-aggregator'
  | 'yoroi-aggregator'
  | string

export type TxStatus = 'txPending' | 'queued' | 'executed' | 'cancelled'

export type OrderType = 0 | 1 | 2

export type Assets = Record<string, number>

export type TokenSummary = {
  ticker: string
  name: string
  policyId: string
  policyName: string
  decimals: number
  priceNumerator?: number
  priceDenominator?: number
  sources?: string[]
}

export type TokensResponse = Array<TokenSummary>

export type PoolOutput = {
  dex: string
  poolId: string
  quantityA: number
  quantityB: number
  batcherFee: number
  deposit: number
  volumeFee: number
}

export type SplitOutput = {
  tokenA: string
  quantityA: number
  tokenB: string
  quantityB: number
  totalFee: number
  totalDeposit: number
  steelswapFee: number
  bonusOut: number
  price: number
  pools: Array<PoolOutput>
}

export type HopSplitOutput = {
  tokenA: string
  quantityA: number
  tokenB: string
  quantityB: number
  totalFee: number
  totalDeposit: number
  steelswapFee: number
  bonusOut: number
  price: number
  splitGroup: Array<Array<SplitOutput>>
}

export type EstimateResponse = SplitOutput | HopSplitOutput

export type SwapEstimateRequest = {
  tokenA: string
  tokenB: string
  quantity: number
  predictFromOutputAmount?: boolean
  ignoreDexes?: string[]
  partner?: Partners | null
  hop?: boolean
  da?: Array<Record<string, number | string>> | string | null
  isFloat?: boolean
}

export type BuildSwapRequest = {
  tokenA: string
  tokenB: string
  quantity: number
  predictFromOutputAmount?: boolean
  ignoreDexes?: string[]
  partner?: Partners | null
  hop?: boolean
  da?: Array<Record<string, number | string>> | string | null
  address: string
  forwardAddress?: string | null
  utxos: string[]
  collateral?: string[] | null
  slippage: number
  changeAddress?: string | null
  pAddress?: string | null
  feeAdust?: boolean
  ttl?: number
  isFloat?: boolean
}

export type BuildSwapResponse = {
  tx: string
  p: boolean
}

export type SwapStatus = {
  dex: string
  orderType: OrderType
  txStatus: TxStatus
  submitTxHash: string
  submitTxIndex: number
  submitTime: number
  submitAssets: Array<Record<string, number>> | null
  requestAssets: Array<Record<string, number>> | null
  executeTxHash: string | null
  executeTxIndex: number | null
  executeTime: number | null
  receivedAssets: Array<Record<string, number>> | null
}

export type OrderStatus = {
  source: string
  firstObserved: number
  lastUpdated: number
  totalSubmitted: Assets
  totalRequested: Assets
  totalReceived: Assets
  swaps: Array<SwapStatus>
}

export type OrderStatusResponse = {
  orders: Array<OrderStatus>
  page: number
  lastPage: number
}

export type SwapHistoryRequest = {
  addresses: string[]
  txType?: string[]
  page?: number
  pageSize?: number
  isFloat?: boolean
}

export type TxRef = {
  txHash: string
  txIndex: number
}

export type CancelRequest = {
  utxos?: string[] | null
  txList: Array<TxRef>
  collateralUtxo?: string | null
  ttl: number
  changeAddress?: string | null
  partner?: Partners | null
}

export type CancelResponse = string

export type SteelswapApiConfig = {
  partner?: string
  address: string
  primaryTokenInfo: Portfolio.Token.Info
  isPrimaryToken: (token: string | null | undefined) => boolean
  network: Chain.SupportedNetworks
  request?: FetchData
}

// Internal config for transformers
export type SteelswapTransformersConfig = SteelswapApiConfig
