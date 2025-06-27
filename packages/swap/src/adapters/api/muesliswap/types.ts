import {FetchData} from '@yoroi/common'
import {Chain, Portfolio} from '@yoroi/types'

export const Dex = {
  Muesliswap_v2: 'muesliswap-v2',
  Muesliswap_clp: 'muesliswap-clp',
  Minswap_v1: 'minswap-v1',
  Minswap_v2: 'minswap-v2',
  Minswap_stable: 'minswap-stable',
  Spectrum_v1: 'spectrum-v1',
  Teddy_v1: 'teddy-v1',
  Wingriders_v1: 'wingriders-v1',
  Wingriders_v2: 'wingriders-v2',
  Vyfi_v1: 'vyfi-v1',
  Sundaeswap_v1: 'sundaeswap-v1',
  Sundaeswap_v3: 'sundaeswap-v3',
  // fallback to avoid breaking changes order will always fail
  Unsupported: 'unsupported',
} as const

export type Dex = (typeof Dex)[keyof typeof Dex]

export type ProvidersResponse = Record<
  Dex,
  {
    batcher_fee: number
    deposit: number
    cancellation_mem: number
    cancellation_steps: number
  }
>

export type PoolsRequest = {
  dex?: Dex[]
  token_a: Portfolio.Token.Id
  token_b: Portfolio.Token.Id
}

export type PoolsResponse = Array<{
  provider: Dex
  token_a: Portfolio.Token.Id
  token_b: Portfolio.Token.Id
  token_a_liquidity: number
  token_b_liquidity: number
  pool_id: string
  pool_fee: number
  utxo: string
  batcher_address: string | null
  price_a: number | null
  price_b: number | null
}>

export type TokensResponse = Array<{
  ticker: string
  name: string | null
  policyId: string
  hexName: string
  decimals: number | null
  verified: boolean
}>

export type OpenOrdersResponse = {
  orders: Array<{
    from_token: Portfolio.Token.Id
    to_token: Portfolio.Token.Id
    from_amount: string
    to_amount: string
    user_address: string
    dex: Dex
    utxo: string // tx_hash#output_idx
  }>
  numbers_have_decimals: boolean
}

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
  tx_hash: string
  output_idx: number
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
  dex: Dex
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
  dex?: ReadonlyArray<Dex> | Dex
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
  // TODO: @jorbuedo it looks to accept string/array of strings
  dex?: ReadonlyArray<Dex> | Dex
  partner?: string
  numbers_have_decimals?: boolean
}

export type LimitQuoteRequest = {
  buy_token: string
  sell_token: string
  buy_amount: string
  sell_amount: string
  dex?: Dex
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
  frontend_fee: number | string
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
  stakingKey: string
  network: Chain.SupportedNetworks
  request?: FetchData
}
