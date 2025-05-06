export const Dex = {
  Minswap_v1: 'MINSWAP',
  Minswap_v2: 'MINSWAPV2',
  Wingriders_v1: 'WINGRIDER',
  Wingriders_v2: 'WINGRIDERV2',
  Vyfi_v1: 'VYFI',
  Sundaeswap_v1: 'SUNDAESWAP',
  Sundaeswap_v3: 'SUNDAESWAPV3',
  Splash_v1: 'SPLASH',
  Muesliswap_clp: 'MUESLISWAP',
  Muesliswap_v2: 'MUESLISWAPV2',
  // fallback to avoid breaking changes order will always fail
  Unsupported: 'UNSUPPORTED',
} as const

export type Dex = (typeof Dex)[keyof typeof Dex]

export type TokensResponse = Array<{
  token_id: string
  token_decimals?: number
  token_policy: string
  token_ascii?: string
  ticker?: string
  is_verified: boolean
  supply: number
  creation_date: string
  price: number
}>

export type OrdersResponse = Array<{
  _id?: string
  actual_out_amount?: number
  amount_in?: number
  batcher_fee?: number
  deposit?: number
  dex: Dex
  expected_out_amount?: number
  is_dexhunter?: boolean
  is_oor?: boolean
  is_stop_loss?: boolean
  last_update?: string
  output_index?: number
  status: 'COMPLETE' | 'CANCELLED' | 'PENDING'
  submission_time?: string
  token_id_in?: string
  token_id_out?: string
  tx_hash?: string
  update_tx_hash?: string
  user_address?: string
  user_stake?: string
}>

export type CancelRequest = {
  address?: string
  order_id?: string
}

export type CancelResponse = {
  additional_cancellation_fee?: number
  cbor?: string
}

export type Split = {
  amount_in?: number
  batcher_fee?: number
  deposits?: number
  dex: Dex
  expected_output?: number
  expected_output_without_slippage?: number
  fee?: number
  final_price?: number
  initial_price?: number
  pool_fee?: number
  pool_id?: string
  price_distortion?: number
  price_impact?: number
}

export type EstimateRequest = {
  amount_in?: number
  blacklisted_dexes?: Dex[]
  slippage?: number
  token_in?: string
  token_out?: string
}

export type EstimateResponse = {
  average_price?: number
  batcher_fee?: number
  communications?: string[]
  deposits?: number
  dexhunter_fee?: number
  net_price?: number
  net_price_reverse?: number
  partner_code?: string
  partner_fee?: number
  possible_routes?: {
    [key: string]: number
  }
  splits?: Split[]
  total_fee?: number
  total_input?: number
  total_output?: number
  total_output_without_slippage?: number
  blacklisted_dexes?: Array<string> | null
  partner?: string
}

export type ReverseEstimateRequest = {
  amount_out?: number
  blacklisted_dexes?: Dex[]
  slippage: number
  token_in: string
  token_out: string
}

export type ReverseEstimateResponse = {
  average_price?: number
  batcher_fee?: number
  communications?: string[]
  deposits?: number
  dexhunter_fee?: number
  net_price?: number
  net_price_reverse?: number
  partner_fee?: number
  possible_routes?: {
    [key: string]: number
  }
  splits?: Split[]
  total_fee?: number
  total_input?: number
  total_input_without_slippage?: number
  total_output?: number
}

export type LimitEstimateRequest = {
  amount_in?: number
  blacklisted_dexes?: Dex[]
  dex: Dex
  multiples?: number
  token_in?: string
  token_out?: string
  wanted_price?: number
}

export type LimitEstimateResponse = {
  batcher_fee?: number
  blacklisted_dexes?: Dex[] | null
  deposits?: number
  dexhunter_fee?: number
  net_price?: number
  partner?: string
  partner_fee?: number
  possible_routes?: {
    [key: string]: string
  }
  splits?: Split[]
  total_fee?: number
  total_input?: number
  total_output?: number
}

export type LimitBuildRequest = {
  amount_in?: number
  blacklisted_dexes?: Dex[]
  buyer_address?: string
  dex?: Dex
  multiples?: number
  token_in?: string
  token_out?: string
  wanted_price?: number
}

export type LimitBuildResponse = {
  batcher_fee?: number
  cbor?: string
  deposits?: number
  dexhunter_fee?: number
  partner?: string
  partner_fee?: number
  possible_routes?: {
    [key: string]: string
  }
  splits?: Split[]
  totalFee?: number
  total_input?: number
  total_output?: number
}

export type BuildRequest = {
  amount_in: number
  blacklisted_dexes?: Dex[]
  buyer_address: string
  tx_optimization?: boolean
  slippage: number
  token_in: string
  token_out: string
}

export type BuildResponse = {
  average_price?: number
  batcher_fee?: number
  cbor?: string
  communications?: string[]
  deposits?: number
  dexhunter_fee?: number
  net_price?: number
  net_price_reverse?: number
  partner_code?: string
  partner_fee?: number
  possible_routes?: {
    [key: string]: number
  }
  splits?: Split[]
  total_fee?: number
  total_input?: number
  total_input_without_slippage?: number
  total_output?: number
  total_output_without_slippage?: number
}

export type SignRequest = {
  Signatures?: string
  txCbor?: string
}

export type SignResponse = {
  cbor?: string
  strat_id?: string
}
