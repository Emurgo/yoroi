import {Api, Portfolio} from '@yoroi/types'

export namespace DexHunterApi {
  export type AveragePriceResponse = {
    averagePrice: number // (Ada / Token) === price_ab
    price_ab: number // Ada / Token
    price_ba: number // Token / Ada
  }

  export type CancelRequest = {
    address?: string
    order_id?: string
  }

  export type CancelResponse = {
    additional_cancellation_fee?: number
    cbor?: string
  }

  export type OrdersResponse = Array<{
    _id?: string
    actual_out_amount?: number
    amount_in?: number
    batcher_fee?: number
    deposit?: number
    dex?: string
    expected_out_amount?: number
    is_dexhunter?: boolean
    is_oor?: boolean
    is_stop_loss?: boolean
    last_update?: string
    output_index?: number
    status?: string
    submission_time?: string
    token_id_in?: string
    token_id_out?: string
    tx_hash?: string
    update_tx_hash?: string
    user_address?: string
    user_stake?: string
  }>

  export type Split = {
    amount_in?: number
    batcher_fee?: number
    deposits?: number
    dex?: string
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
    blacklisted_dexes?: string[]
    single_preferred_dex?: string
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
    total_output?: number
    total_output_without_slippage?: number
  }

  export type ReverseEstimateRequest = {
    amount_out?: number
    blacklisted_dexes?: string[]
    buyer_address?: string
    is_optimized?: boolean
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
    price_ab?: number
    price_ba?: number
    splits?: Split[]
    total_fee?: number
    total_input?: number
    total_input_without_slippage?: number
    total_output?: number
  }

  export type LimitOrderRequest = {
    amount_in?: number
    blacklisted_dexes?: string[]
    buyer_address?: string
    dex?: string
    multiples?: number
    token_in?: string
    token_out?: string
    wanted_price?: number
  }

  export type LimitOrderResponse = {
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

  export type LimitOrderEstimate = {
    batcher_fee?: number
    blacklisted_dexes?: string[]
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

  export type SignRequest = {
    Signatures?: string
    txCbor?: string
  }

  export type SignResponse = {
    cbor?: string
    strat_id?: string
  }

  export type SwapRequest = {
    amount_in: number
    blacklisted_dexes?: string[]
    buyer_address: string
    inputs?: string[]
    slippage: number
    token_in: string
    token_out: string
  }

  export type SwapResponse = {
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

  export type TokensResponse = Array<{
    token_id: string
    token_decimals: number
    token_policy: string
    token_ascii: string
    ticker: string
    is_verified: boolean
    supply: number
    creation_date: string

    price: number
  }>

  export type AveragePriceArgs = {
    tokenInId: Portfolio.Token.Id
    tokenOutId: Portfolio.Token.Id
  }

  export type OrdersArgs = {address: string}

  export type CancelArgs = {
    address: string
    orderId: string
  }

  export type EstimateArgs = {
    amountIn: number
    blacklistedDexes?: string[]
    singlePreferredDex?: string
    slippage?: number
    tokenIn: Portfolio.Token.Id
    tokenOut: Portfolio.Token.Id
  }

  export type ReverseEstimateArgs = {
    amountOut: number
    blacklistedDexes?: string[]
    address: string
    isOptimized?: boolean
    slippage: number
    tokenIn: Portfolio.Token.Id
    tokenOut: Portfolio.Token.Id
  }

  export type LimitOrderArgs = {
    amountIn: number
    blacklistedDexes?: string[]
    address: string
    dex?: string
    multiples?: number
    tokenIn: Portfolio.Token.Id
    tokenOut: Portfolio.Token.Id
    wantedPrice: number
  }

  export type SignArgs = {
    signatures: string
    txCbor: string
  }

  export type SwapArgs = {
    amountIn: number
    blacklistedDexes?: string[]
    address: string
    inputs: string[]
    slippage: number
    tokenIn: Portfolio.Token.Id
    tokenOut: Portfolio.Token.Id
  }

  export type Interface = {
    averagePrice: (
      args: AveragePriceArgs,
    ) => Promise<Readonly<Api.Response<number>>>
    tokens: () => Promise<
      Readonly<Api.Response<ReadonlyArray<Portfolio.Token.Info>>>
    >
    orders: (
      args: OrdersArgs,
    ) => Promise<Readonly<Api.Response<OrdersResponse>>>
    estimate: (
      args: EstimateArgs,
    ) => Promise<Readonly<Api.Response<EstimateResponse>>>
    reverseEstimate: (
      args: ReverseEstimateArgs,
    ) => Promise<Readonly<Api.Response<ReverseEstimateResponse>>>
    swap: (args: SwapArgs) => Promise<Readonly<Api.Response<SwapResponse>>>
    sign: (args: SignArgs) => Promise<Readonly<Api.Response<SignResponse>>>
    cancel: (
      args: CancelArgs,
    ) => Promise<Readonly<Api.Response<CancelResponse>>>
    limit: (
      args: LimitOrderArgs,
    ) => Promise<Readonly<Api.Response<LimitOrderResponse>>>
    limitEstimate: (
      args: LimitOrderArgs,
    ) => Promise<Readonly<Api.Response<LimitOrderEstimate>>>
  }

  // -------------------------
  // UNUSED
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
  // END UNUSED
  // -------------------------
}
