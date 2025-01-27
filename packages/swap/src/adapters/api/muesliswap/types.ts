import {Portfolio} from '@yoroi/types'

export const Provider = {
  Muesliswap_v2: 'muesliswap-v2',
  Muesliswap_clp: 'muesliswap-clp',
  Minswap_v1: 'minswap-v1',
  Minswap_v2: 'minswap-v2',
  Minswap_stable: 'minswap-stable',
  Spectrum_v1: 'spectrum-v1',
  Teddy_v1: 'teddy-v1',
  Wingriders_v1: 'wingriders-v1',
  Vyfi_v1: 'vyfi-v1',
  Sundaeswap_v1: 'sundaeswap-v1',
  Sundaeswap_v3: 'sundaeswap-v3',
} as const

export type Provider = (typeof Provider)[keyof typeof Provider]

export type ProvidersResponse = Record<
  Provider,
  {
    batcher_fee: number
    deposit: number
    cancellation_mem: number
    cancellation_steps: number
  }
>

export type PoolsRequest = {
  dex?: Provider[]
  token_a: Portfolio.Token.Id
  token_b: Portfolio.Token.Id
}

export type PoolsResponse = Array<{
  provider: Provider
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
  name: string
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
    dex: Provider
    utxo: string // tx_hash#output_idx
  }>
  numbers_have_decimals: boolean
}

export type HistoryOrdersResponse = {
  orders: Array<{
    dex: Provider
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
  buy_amount: number
  sell_amount: number
  user_address: string
  dex: Provider
  partner?: string
  numbers_have_decimals?: boolean
}

export type CreateOrderRequest = {
  buy_token: string
  sell_token: string
  buy_amount?: number
  sell_amount?: number
  user_address: string
  slippage?: number
  dex?: Array<Provider>
  partner?: string
  numbers_have_decimals?: boolean
}

export type QuoteRequest = {
  buy_token: string
  sell_token: string
  buy_amount?: number
  sell_amount?: number
  slippage?: number
  dex?: Array<Provider>
  partner?: string
  numbers_have_decimals?: boolean
}

export type LimitQuoteRequest = {
  buy_token: string
  sell_token: string
  buy_amount: number
  sell_amount: number
  dex?: Provider
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
  dex: Provider
  pool_fee: number
  expected_output_without_slippage: number | string
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
  net_price_imact: number
  frontend_fee: number | string
  total_output_without_slippage: number | string
  splits: Array<Split>
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
