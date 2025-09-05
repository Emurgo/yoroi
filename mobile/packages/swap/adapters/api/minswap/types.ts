import {FetchData} from '@yoroi/common'
import {Chain, Portfolio} from '@yoroi/types'

export const Dex = {
  MinswapV2: 'MinswapV2',
  Minswap: 'Minswap',
  MinswapStable: 'MinswapStable',
  MuesliSwap: 'MuesliSwap',
  Splash: 'Splash',
  SundaeSwapV3: 'SundaeSwapV3',
  SundaeSwap: 'SundaeSwap',
  VyFinance: 'VyFinance',
  CswapV1: 'CswapV1',
  WingRidersV2: 'WingRidersV2',
  WingRiders: 'WingRiders',
  WingRidersStableV2: 'WingRidersStableV2',
  Spectrum: 'Spectrum',
  SplashStable: 'SplashStable',
  // fallback to avoid breaking changes order will always fail
  Unsupported: 'Unsupported',
} as const

export type Dex = (typeof Dex)[keyof typeof Dex]

export type AdaPriceResponse = {
  currency: string
  value: {
    change_24h: number
    price: number
  } | null
}

export type WalletBalanceResponse = {
  wallet: string
  ada: string
  minimum_lovelace: string
  balance: Array<{
    asset: {
      token_id: string
      logo: string | null
      ticker: string | null
      is_verified: boolean | null
      price_by_ada: number | null
      project_name: string | null
      decimals: number | null
    }
    amount: string
  }>
  amount_in_decimal: boolean
}

export type TokensResponse = {
  tokens: Array<{
    token_id: string
    logo: string | null
    ticker: string | null
    is_verified: boolean | null
    price_by_ada: number | null
    project_name: string | null
    decimals: number | null
  }>
  total: number
  page: number
  limit: number
  search_after?: any[]
}

export type TokensRequest = {
  query: string
  only_verified: boolean
  assets?: string[]
  page?: number
  limit?: number
}

export type EstimateRequest = {
  token_in: string
  token_out: string
  amount: string
  slippage: number
  exclude_protocols?: string[]
  include_protocols?: string[]
  allow_multi_hops?: boolean
  partner?: string
  amount_in_decimal?: boolean
}

export type EstimateResponse = {
  token_in: string
  token_out: string
  amount_in: string
  amount_out: string
  amount_in_decimal: boolean
  avg_price_impact: number
  min_amount_out: string
  aggregator_fee: string
  aggregator_fee_percent: number
  deposits: string
  total_dex_fee: string
  total_lp_fee: string
  paths: Array<any>
  route: Array<{
    pool: {
      pool_id: string
      fee: number
      token_a: {
        token_id: string
        logo: string | null
        ticker: string | null
        is_verified: boolean | null
        price_by_ada: number | null
        project_name: string | null
        decimals: number | null
      }
      token_b: {
        token_id: string
        logo: string | null
        ticker: string | null
        is_verified: boolean | null
        price_by_ada: number | null
        project_name: string | null
        decimals: number | null
      }
    }
    amount_in: string
    amount_out: string
  }>
  aggregator: 'Minswap'
}

export type CreateRequest = {
  sender: string
  min_amount_out: string
  estimate: {
    amount: string
    token_in: string
    token_out: string
    slippage: number
    exclude_protocols?: string[]
    include_protocols?: string[]
    allow_multi_hops?: boolean
    partner?: string
  }
  amount_in_decimal?: boolean
}

export type CreateResponse = {
  cbor: string
}

export type LimitOptionsRequest = {
  token_in: string
  token_out: string
  amount_in: string
  amount_out: string
}

export type LimitOptionsResponse = {
  token_in: {
    token_id: string
    logo: string | null
    ticker: string | null
    is_verified: boolean | null
    price_by_ada: number | null
    project_name: string | null
    decimals: number | null
  }
  token_out: {
    token_id: string
    logo: string | null
    ticker: string | null
    is_verified: boolean | null
    price_by_ada: number | null
    project_name: string | null
    decimals: number | null
  }
  amount_in: string
  amount_out: string
  price: number
  options: Array<{
    protocol: Dex
    pool_id: string
    fee: number
    price: number
    liquidity: string
  }>
}

export type PendingOrdersResponse = {
  orders: Array<{
    owner_address: string
    protocol: Dex
    token_in: {
      token_id: string
      logo: string | null
      ticker: string | null
      is_verified: boolean | null
      price_by_ada: number | null
      project_name: string | null
      decimals: number | null
    }
    token_out: {
      token_id: string
      logo: string | null
      ticker: string | null
      is_verified: boolean | null
      price_by_ada: number | null
      project_name: string | null
      decimals: number | null
    }
    amount_in: string
    min_amount_out: string
    created_at: number
    tx_in: string
    dex_fee: string
    deposit: string
  }>
  amount_in_decimal: boolean
}

export type CancelRequest = {
  sender: string
  orders: Array<{
    tx_in: string
    protocol: Dex
  }>
}

export type CancelResponse = {
  cbor: string
}

export type MinswapApiConfig = {
  partner?: string
  address: string
  primaryTokenInfo: Portfolio.Token.Info
  isPrimaryToken: (token: string | null | undefined) => boolean
  network: Chain.SupportedNetworks
  request?: FetchData
}
