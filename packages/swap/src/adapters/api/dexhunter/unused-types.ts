/**
 * OrdersRequest seems unused in v3 as orders endpoint accepts no body
 */
export type OrdersRequest = {
  filters?: {
    filterType?:
      | 'TOKENID'
      | 'STATUS'
      | 'TXTYPE'
      | 'TIMESTART'
      | 'TIMEEND'
      | 'DEXNAME'
      | 'SEARCH'
      | 'ADDRESS'
      | 'MINAMOUNT'
      | 'MAXAMOUNT'
      | 'TXHASH'
      | 'OWNED'
    values?: string[] // Ex. for status: PENDING | LIMIT | COMPLETED | CANCELLED
  }[]
  orderSorts?: 'AMOUNTIN' | 'DATE'
  page?: number
  perPage?: number
  sortDirection?: 'ASC' | 'DESC'
}

export type AveragePriceResponse = {
  averagePrice: number // (Ada / Token) === price_ab
  price_ab: number // Ada / Token
  price_ba: number // Token / Ada
}

export type WalletInfoRequest = {
  addresses?: string[]
}

export type WalletInfoResponse = {
  cardano?: {
    [key: string]: number
  }
  tokens?: UserToken[]
}

export type UserToken = {
  ada_value?: number
  amount?: number
  ticker?: string
  token_ascii?: string
  token_id?: string
}

export type OHLC = {
  close?: number
  high?: number
  low?: number
  open?: number
  timestamp?: string
  volume?: number
}

export type Period =
  | '1min'
  | '5min'
  | '15min'
  | '30min'
  | '1hour'
  | '4hour'
  | '1day'

export type ChartRequest = {
  from?: number
  isLast?: boolean
  period?: Period
  to?: number
  tokenIn?: string
  tokenOut?: string
}

export type ChartResponse = {
  data?: OHLC[]
  period?: Period
}

export type CancelDcaRequest = {
  dca_id?: string
  user_address?: string
}

export type CancelDcaResponse = {
  [key: string]: string
}

export type CreateDcaRequest = {
  amount_in?: number
  cycles?: number
  dex_allowlist?: string[]
  interval?: DcaInterval
  interval_length?: number
  token_in?: string
  token_out?: string
  user_address?: string
}

export type CreateDcaResponse = {
  amount_ada_in?: number
  amount_token_in?: number
  batchers_deposit?: number
  cbor?: string
  dca_id?: string
  dh_fee?: number
  tx_fees_deposit?: number
}

export type DcaInterval =
  | 'minutely'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'

export type DcaResponse = {
  amount_dcad?: number
  creation_tx?: string
  current_slot?: number
  dca_amount?: number
  id?: string
  interval?: number
  last_execution?: string
  next_execution?: string
  remaining_cycles?: number
  status?: 'active' | 'error' | 'done'
  token_in?: string
  token_out?: string
  total_dca?: number
}

export type MarkingType = 'LIMIT' | 'STOP_LOSS' | 'DCA' | 'SWAP'
export type MarkingRequest = {
  cbor?: string
  order_type?: MarkingType
  tx_hash?: string
}
