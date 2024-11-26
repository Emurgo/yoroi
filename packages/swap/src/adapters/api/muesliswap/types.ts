import {Portfolio} from '@yoroi/types'

export type TokensResponse = Array<{
  info: {
    supply: {
      total: string // total circulating supply of the token, without decimals.
      circulating: string | null // if set the circulating supply of the token, if null the amount in circulation is unknown.
    }
    status: 'verified' | 'unverified' | 'scam' | 'outdated'
    address: {
      policyId: string // policy id of the token.
      name: string // hexadecimal representation of token name.
    }
    symbol: string // shorthand token symbol.
    image?: string // http link to the token image.
    website: string
    description: string
    decimalPlaces: number // number of decimal places of the token, i.e. 6 for ADA and 0 for MILK.
    categories: string[] // encoding categories as ids.
    sign?: string // token sign, i.e. "₳" for ADA.
  }
  price: {
    volume: {
      base: string // float, trading volume 24h in base currency (e.g. ADA).
      quote: string // float, trading volume 24h in quote currency.
    }
    volumeChange: {
      base: number // float, percent change of trading volume in comparison to previous 24h.
      quote: number // float, percent change of trading volume in comparison to previous 24h.
    }
    price: number // live trading price in base currency (e.g. ADA).
    askPrice: number // lowest ask price in base currency (e.g. ADA).
    bidPrice: number // highest bid price in base currency (e.g. ADA).
    priceChange: {
      '24h': string // float, price change last 24 hours.
      '7d': string // float, price change last 7 days.
    }
    quoteDecimalPlaces: number // decimal places of quote token.
    baseDecimalPlaces: number // decimal places of base token.
    price10d: number[] //float, prices of this tokens averaged for the last 10 days, in chronological order i.e.oldest first.
  }
}>

export type OpenOrdersResponse = Array<{
  from_token: Portfolio.Token.Id
  to_token: Portfolio.Token.Id
  from_amount: number
  to_amount: number
  user_address: string
  dex: Provider
  utxo: string // tx_hash#output_idx
}>

export type HistoryOrdersResponse = Array<{
  dex: Provider
  aggregator: null
  fromToken: Portfolio.Token.Id
  toToken: Portfolio.Token.Id
  fromAmount: number
  toAmount: number
  paidAmount: number
  receivedAmount: number
  batcherFee: number
  attachedValues: Array<{
    amount: number
    token: string
  }>
  sender: string
  beneficiary: string
  txHash: string
  outputIdx: number
  deposit: number
  status: string | 'open' | 'matched'
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

export type CancelRequest = {
  tx_hash: string
  ouput_idx: number
}

export type CancelResponse = {
  tx_cbor: string
}

export const Provider = {
  Muesliswap_v2: 'muesliswap-v2',
  Minswap_v1: 'minswap-v1',
  Minswap_v2: 'minswap-v2',
  Spectrum_v1: 'spectrum-v1',
  Teddy_v1: 'teddy-v1',
  Wingriders_v1: 'wingriders-v1',
  Vyfi_v1: 'vyfi-v1',
  Sundaeswap_v1: 'sundaeswap-v1',
  Sundaeswap_v3: 'sundaeswap-v3',
} as const

export type Provider = (typeof Provider)[keyof typeof Provider]

export type LimitOrderRequest = {
  buy_token: string
  sell_token: string
  buy_amount: number
  sell_amount: number
  user_address: string
  dex: Provider
  partner?: string
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
}

export type QuoteRequest = {
  buy_token: string
  sell_token: string
  buy_amount?: number
  sell_amount?: number
  slippage?: number
  dex?: Array<Provider>
}

export type Split = {
  amount_in: number
  total_lvl_attached: number
  deposit: number
  batcher_fee: number
  expected_output: number
  source_id: string
  initial_price: number
  final_price: number
  price_impact: number
  dex: Provider
  pool_fee: number
  expected_output_without_slippage: number
}
export type QuoteResponse = {
  total_lvl_attached: number
  total_deposit: number
  total_batcher_fee: number
  total_output: number
  total_input: number
  buy_token_decimals: number
  sell_token_decimals: number
  net_price: number
  total_output_without_slippage: number
  splits: Array<Split>
}

export type CreateOrderResponse = {
  quote: QuoteResponse
  tx_cbor: string
}

export type LimitOrderResponse = {
  tx_cbor: string
}
