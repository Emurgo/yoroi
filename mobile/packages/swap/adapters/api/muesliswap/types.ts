import {FetchData} from '@yoroi/common'
import {Chain, Portfolio} from '@yoroi/types'

export const Dex = {
  Muesliswap: 'muesliswap',
  Muesliswap_v1: 'muesliswap-v1',
  Muesliswap_v2: 'muesliswap-v2',
  Muesliswap_clp: 'muesliswap-clp',
  Muesliswap_orderbook: 'muesliswap-orderbook',
  Minswap_v1: 'minswap-v1',
  Minswap_v2: 'minswap-v2',
  Minswap_stable: 'minswap-stable',
  Spectrum_v1: 'spectrum-v1',
  Teddy_v1: 'teddy-v1',
  Wingriders_v1: 'wingriders-v1',
  Wingriders_v2: 'wingriders-v2',
  Wingriders_stable: 'wingriders-stable',
  Vyfi_v1: 'vyfi-v1',
  Sundaeswap_v1: 'sundaeswap-v1',
  Sundaeswap_v3: 'sundaeswap-v3',
  Cswap_v1: 'cswap-v1',
  Splash_v4: 'splash-v4',
  Splash_v5: 'splash-v5',
  Splash_v6: 'splash-v6',
  Splash_degen_quad: 'splash-degen-quad',
  // fallback to avoid breaking changes order will always fail
  Unsupported: 'unsupported',
} as const

export type Dex = (typeof Dex)[keyof typeof Dex]

export type TokensResponse = Array<{
  ticker: string
  name: string | null
  policyId: string
  hexName: string
  decimals: number | null
  verified: boolean
}>

export type OrdersHistoryResponse = {
  orders: Array<{
    dex: Dex
    aggregator: null
    fromToken: Portfolio.Token.Id
    toToken: Portfolio.Token.Id
    fromAmount: string
    toAmount: string
    paidAmount: string
    receivedAmount: string
    batcherFee: string
    attachedValues: Array<{
      amount: number
      token: string
    }>
    sender: string
    beneficiary: string
    txHash: string
    outputIdx: number
    deposit: string
    status: 'open' | 'matched' | 'canceled' | 'partially_matched'
    placedAt: number
    finalizedAt: number | null
    finalizedTxHash: string | null
    providerSpecifics: {
      allowPartial?: boolean
      contractVersion?: number
      poolId?: string
      swapDirection?: number
    } | null
  }>
  numbers_have_decimals: boolean
}

export type CancelRequest = {
  order_ids: string[]
}

export type CancelResponse = {
  tx_cbor: string
}

export type LimitOrderRequest = {
  buy_token: string
  sell_token: string
  buy_amount: string
  sell_amount: string
  user_address: string
  // Changed from dex to order_contract
  order_contract?: Dex
  // Optional pool selection for limit orders
  pool_id?: string | null
  partner?: string
  numbers_have_decimals?: boolean
  utxos?: string[]
}

export type CreateOrderRequest = {
  buy_token: string
  sell_token: string
  buy_amount?: string
  sell_amount?: string
  user_address: string
  slippage?: number
  // Frontend Options to exclude (from /providers liquidity_source_info)
  excluded_sources?: ReadonlyArray<Dex | string>
  partner?: string
  numbers_have_decimals?: boolean
  utxos?: string[]
}

export type QuoteRequest = {
  buy_token: string
  sell_token: string
  buy_amount?: string
  sell_amount?: string
  slippage?: number
  // Frontend Options to exclude (from /providers liquidity_source_info)
  excluded_sources?: ReadonlyArray<Dex | string>
  partner?: string
  numbers_have_decimals?: boolean
}

export type LimitQuoteRequest = {
  buy_token: string
  sell_token: string
  buy_amount: string
  sell_amount: string
  // Changed from dex to order_contract
  order_contract?: Dex
  pool_id?: string | null
  partner?: string
  numbers_have_decimals?: boolean
}

export type Split = {
  amount_in: number | string
  total_lvl_attached: number | string
  deposit: number | string
  batcher_fee: number | string
  expected_output: number | string
  source_id: string
  initial_price: number
  final_price: number
  price_impact: number
  dex: Dex
  pool_fee: number
  expected_output_without_slippage?: number | string
  price_distortion: number
}

export type QuoteResponse = {
  total_lvl_attached: number | string
  total_deposit: number | string
  total_batcher_fee: number | string
  total_output: number | string
  total_input: number | string
  buy_token_decimals: number
  sell_token_decimals: number
  net_price: number
  net_price_impact: number
  // Changed from frontend_fee to service_fee
  service_fee: number | string
  total_output_without_slippage?: number | string
  splits: Array<Split>
  numbers_have_decimals: boolean
}

export type CreateOrderResponse = {
  quote: QuoteResponse
  tx_cbor: string
}

export type LimitOrderResponse = {
  quote: QuoteResponse
  tx_cbor: string
}

export type LimitQuoteResponse = QuoteResponse

export type MuesliswapApiConfig = {
  partner?: string
  addressHex: string
  address: string
  primaryTokenInfo: Portfolio.Token.Info
  isPrimaryToken: (token: string | null | undefined) => boolean
  network: Chain.SupportedNetworks
  request?: FetchData
}

// Provider info types (for GET /providers)
export type DexInfoResponse = {
  order_protocols: string[]
  liquidity_protocols: string[]
  routes: string[]
  name: string
  image: string
}

export type RouteInfo = {
  batcher_fee: number
  deposit: number
}

export type OrderContractInfo = {
  cancellation_mem: number
  cancellation_steps: number
  is_orderbook: boolean
  requires_pool_id: boolean
}

export type LiquiditySourceInfo = {
  frontend_option: string
}

export type ProviderInfoResponse = {
  dex_info: Record<string, DexInfoResponse>
  route_info: Record<string, RouteInfo>
  order_contract_info: Record<string, OrderContractInfo>
  liquidity_source_info: Record<string, LiquiditySourceInfo>
}

export type RouteHint = {
  orderContract?: string
  poolIds?: ReadonlyArray<string>
  frontendOptions?: ReadonlyArray<string>
  aggregatorDexKey?: string
}
