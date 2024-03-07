/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface BasketBasket {
  creator?: string
  /** Description is the description of the basket */
  description?: string
  /** ID is the unique identifier of the basket */
  id?: string
  /** Name is the name of the basket */
  name?: string
  /** Tokens is the list of tokens in the basket */
  tokens?: BasketBasketPart[]
}

export interface BasketBasketEstimateRequest {
  address?: string
  /** Amount is the amount of the basket */
  amount_in?: number
  /** ID is the unique identifier of the basket */
  basket_id?: string
  slippage?: number
  tx_type?: BasketBasketTxType
}

export interface BasketBasketEstimateResponse {
  dex_hunter_fee?: number
  expected_output?: Record<string, number>
  /**
   * Amount is the amount of the basket
   * Amount int64 `json:"amount_in" bson:"amount_in"`
   * Fee is the fee of the basket
   */
  fee?: number
  inputs?: Record<string, number>
  pcts?: Record<string, number>
}

export interface BasketBasketFilter {
  /** Field is the field to filter */
  field?: BasketBasketFilterType
  /** Value is the value to filter */
  value?: string
}

export type BasketBasketFilterType = 'creator'

export interface BasketBasketPart {
  /** Pct is the percentage of the token in the basket */
  pct?: number
  /** TokenId is the unique identifier of the token */
  tokenId?: string
}

export type BasketBasketTxType = 'buy' | 'sell'

export interface BasketCreateBasketRequest {
  address?: string
  /** Description is the description of the basket */
  description?: string
  /** Name is the name of the basket */
  name?: string
  /** Tokens is the list of tokens in the basket */
  tokens?: BasketBasketPart[]
}

export interface BasketDeleteBasketRequest {
  /** ID is the unique identifier of the basket */
  basket_id?: string
}

export interface BasketGetBasketsRequest {
  filters?: BasketBasketFilter[]
  /** Page is the page number */
  page?: number
  /** PerPage is the number of items per page */
  per_page?: number
}

export interface BasketGetBasketsResponse {
  /** Baskets is the list of baskets */
  baskets?: BasketBasket[]
}

export interface BasketTokenBasketSwapRequest {
  address?: string
  /** Amount is the amount of the basket */
  amount_in?: number
  /** ID is the unique identifier of the basket */
  basket_id?: string
  slippage?: number
  tx_type?: BasketBasketTxType
}

export interface BatchersPartnerPayout {
  fees?: string[]
  id?: string
  is_confirmed?: boolean
  partner?: string
  timestamp?: string
  total_lovelace?: number
  total_lovelace_for_dh?: number
  total_lovelace_for_partner?: number
  tx_hash?: string
}

export interface DexhunterBulkBuyBody {
  buyer_address?: string
  trades?: SwaputilsTrade[]
}

export interface DexhunterBulkCancelRequest {
  address?: string
  order_ids?: string[]
}

export interface DexhunterCancelRequest {
  address?: string
  order_id?: string
}

export interface DexhunterCancelResponse {
  additional_cancellation_fee?: number
  cbor?: string
}

export interface DexhunterLimitOrderEstimate {
  batcher_fee?: number
  blacklisted_dexes?: ModelsDexName[]
  deposits?: number
  dexhunter_fee?: number
  net_price?: number
  possible_routes?: Record<string, string>
  splits?: DexhunterLimitSplit[]
  total_fee?: number
  total_input?: number
  total_output?: number
}

export interface DexhunterLimitOrderRequest {
  amount_in?: number
  blacklisted_dexes?: ModelsDexName[]
  buyer_address?: string
  dex?: ModelsDexName
  multiples?: number
  token_in?: string
  token_out?: string
  wanted_price?: number
}

export interface DexhunterLimitOrderResponse {
  batcher_fee?: number
  cbor?: string
  deposits?: number
  dexhunter_fee?: number
  possible_routes?: Record<string, string>
  splits?: DexhunterLimitSplit[]
  totalFee?: number
  total_input?: number
  total_output?: number
}

export interface DexhunterLimitSplit {
  amount_in?: number
  batcher_fee?: number
  deposits?: number
  dex?: ModelsDexName
  expected_output_without_slippage?: number
  fee?: number
}

export interface DexhunterOrdersByPair {
  orders?: ModelsOrder[]
}

export type DexhunterPeriod =
  | '1m'
  | '2m'
  | '3m'
  | '5m'
  | '10m'
  | '15m'
  | '30m'
  | '1h'
  | '4h'
  | '12h'
  | '1d'
  | '1w'
  | '1M'

export interface DexhunterSignatureResponse {
  cbor?: string
}

export type DexhunterTTSort = 'VOLUME_AMOUNT' | 'VOLUME_CHANGE'

export interface DexhunterTrendingToken {
  amount_buys?: number
  amount_sales?: number
  current_closing_price?: number
  current_period_vol?: number
  previous_closing_price?: number
  previous_period_vol?: number
  price_change_percentage?: number
  token_id?: string
  token_name?: string
  token_symbol?: string
  volume_change_percentage?: number
}

export interface DexhunterTrendingTokensRequest {
  page?: number
  perPage?: number
  period?: DexhunterPeriod
  sort?: DexhunterTTSort
}

export interface DexhunterTrendingTokensResponse {
  tokens?: DexhunterTrendingToken[]
}

export interface DexhunterWalletInfo {
  addresses?: string[]
}

export interface DexhunterWalletInfoResponse {
  cardano?: Record<string, number>
  tokens?: ModelsUserToken[]
}

export type ModelsDexName =
  | 'MINSWAP'
  | 'VYFI'
  | 'WINGRIDER'
  | 'SUNDAESWAP'
  | 'SPECTRUM'
  | 'MUESLISWAP'
  | 'CROSSCHAIN'
  | 'TEDDY'

export interface ModelsGlobalOrdersRequest {
  filters?: ModelsOrderFilter[]
  orderSorts?: ModelsOrderSorts
  page?: number
  perPage?: number
  sortDirection?: ModelsSortDirection
}

export interface ModelsOrder {
  _id?: string
  actual_out_amount?: number
  amount_in?: number
  batcher_fee?: number
  deposit?: number
  dex?: ModelsDexName
  dexhunter_fee?: number
  expected_out_amount?: number
  is_dexhunter?: boolean
  is_stop_loss?: boolean
  last_update?: string
  plutus_data?: string
  pool_id?: string
  status?: ModelsOrderStatus
  stop_loss_chunks?: number
  submission_time?: string
  token_id_in?: string
  token_id_out?: string
  tx_hash?: string
  tx_output_index?: number
  update_tx_hash?: string
  user_address?: string
  user_stake?: string
}

export interface ModelsOrderFilter {
  filterType?: ModelsOrderFilterType
  values?: string[]
}

export type ModelsOrderFilterType =
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

export interface ModelsOrderRequest {
  filters?: ModelsOrderFilter[]
  orderSorts?: ModelsOrderSorts
  page?: number
  perPage?: number
  sortDirection?: ModelsSortDirection
}

export type ModelsOrderSorts = 'AMOUNTIN' | 'DATE'

export type ModelsOrderStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'BATCHING'
  | 'EXPIRED'
  | 'LIMIT'
  | 'STOPLOSS'

export interface ModelsPartnerDeal {
  has_minimum?: boolean
  is_laddered?: boolean
  min_trade_size?: number
  partner?: string
  partner_header?: string
  partner_pct?: number
  partner_receiving_address?: string
  settings?: any
  skip_extra_cancellation_fee?: boolean
  split_pct?: number
}

export type ModelsSortDirection = 'ASC' | 'DESC'

export interface ModelsToken {
  icon?: string
  is_verified?: boolean
  supply?: string
  ticker?: string
  token_ascii?: string
  token_decimals?: string
  token_id?: string
  token_policy?: string
}

export interface ModelsTokenInfo {
  icon?: string
  is_verified?: boolean
  price?: number
  supply?: string
  ticker?: string
  token1_amt?: string
  token2_amt?: string
  token_ascii?: string
  token_decimals?: string
  token_id?: string
  token_policy?: string
}

export interface ModelsUserToken {
  ada_value?: number
  amount?: number
  ticker?: string
  token_ascii?: string
  token_id?: string
}

export interface PartnersCreatePartnerRequest {
  creator_key?: string
  partner_name?: string
  partner_pct?: number
  partner_receiving_address?: string
}

export interface PartnersPartnerInfos {
  partner_deal?: ModelsPartnerDeal
  payouts?: BatchersPartnerPayout[]
  total_completed_fees?: number
  total_payouts_for_partner?: number
  total_payouts_for_provider?: number
  total_payouts_overall?: number
  total_pending_fees?: number
  total_ready_for_payout_fees?: number
  total_txs?: number
}

export interface StoplossCancelStopLossBody {
  stop_loss_id?: string
  user_address?: string
}

export interface StoplossStopLossCreationRequest {
  amount?: number
  chunks?: number
  max_price_change?: number
  price?: number
  token_in?: string
  user_address?: string
}

export interface StoplossStopLossResponse {
  cbor?: string
  dex?: ModelsDexName
  expected_output?: number
  expected_output_without_slippage?: number
  total_dex_fees?: number
  total_dexhunter_fees?: number
  total_input?: number
}

export interface SwaputilsBulkBuyResponse {
  batcher_fee?: number
  cbor?: string
  deposits?: number
  dexhunter_fee?: number
  total_fee?: number
  trades?: {
    average_price?: number
    batcher_fee?: number
    deposits?: number
    dexhunter_fee?: number
    possible_routes?: Record<string, number>
    price_ab?: number
    price_ba?: number
    splits?: SwaputilsSplit[]
    total_fee?: number
    total_output?: number
    total_output_without_slippage?: number
    trade?: SwaputilsTrade
  }[]
}

export interface SwaputilsCustomSwapObject {
  /** @example 1 */
  amount_in: number
  /** @example [""] */
  blacklisted_dexes?: ModelsDexName[]
  /** @example "addr1qxajla3qcrwckzkur8n0lt02rg2sepw3kgkstckmzrz4ccfm3j9pqrqkea3tns46e3qy2w42vl8dvvue8u45amzm3rjqvv2nxh" */
  change_receiver_address: string
  /** @example "addr1qxajla3qcrwckzkur8n0lt02rg2sepw3kgkstckmzrz4ccfm3j9pqrqkea3tns46e3qy2w42vl8dvvue8u45amzm3rjqvv2nxh" */
  input_address: string
  /** @example [""] */
  inputs?: string[]
  /** @example "" */
  single_preferred_dex?: ModelsDexName
  /** @example 2 */
  slippage: number
  /** @example "addr1qxajla3qcrwckzkur8n0lt02rg2sepw3kgkstckmzrz4ccfm3j9pqrqkea3tns46e3qy2w42vl8dvvue8u45amzm3rjqvv2nxh" */
  swap_receiver_address: string
  /** @example "" */
  token_in: string
  /** @example "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454b" */
  token_out: string
}

export interface SwaputilsEstimationRequest {
  /** @example 1 */
  amount_in: number
  /** @example [""] */
  blacklisted_dexes?: ModelsDexName[]
  /** @example "addr1qxajla3qcrwckzkur8n0lt02rg2sepw3kgkstckmzrz4ccfm3j9pqrqkea3tns46e3qy2w42vl8dvvue8u45amzm3rjqvv2nxh" */
  buyer_address?: string
  /** @example false */
  is_optimized?: boolean
  /** @example "" */
  referrer?: string
  /** @example "" */
  single_preferred_dex?: ModelsDexName
  /** @example 2 */
  slippage: number
  /** @example "" */
  token_in: string
  /** @example "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454b" */
  token_out: string
}

export interface SwaputilsEstimationResponse {
  average_price?: number
  batcher_fee?: number
  deposits?: number
  dexhunter_fee?: number
  net_price?: number
  net_price_reverse?: number
  partner_fee?: number
  possible_routes?: Record<string, number>
  price_ab?: number
  price_ba?: number
  splits?: SwaputilsSplit[]
  total_fee?: number
  total_input?: number
  total_input_without_slippage?: number
  total_output?: number
  total_output_without_slippage?: number
}

export interface SwaputilsPairStats {
  dailyBuysCount?: number
  dailySalesCount?: number
  dailyTxAmount?: number
  dailyVolume?: number
  pools?: SwaputilsPoolStat[]
  poolsAmount?: number
  priceChangeDay?: number
  priceChangeHour?: number
  priceChangeMonth?: number
  priceChangeWeek?: number
  token1Amount?: number
  token2Amount?: number
}

export interface SwaputilsPoolStat {
  dailyBuysCount?: number
  dailySalesCount?: number
  dailyTxAmount?: number
  dailyVolume?: number
  dexName?: ModelsDexName
  priceChangeDay?: number
  priceChangeHour?: number
  priceChangeMonth?: number
  priceChangeWeek?: number
  token1Amount?: number
  token2Amount?: number
}

export interface SwaputilsReverseEstimationRequest {
  /** @example 2 */
  amount_out?: number
  /** @example [""] */
  blacklisted_dexes?: ModelsDexName[]
  /** @example "addr1qxajla3qcrwckzkur8n0lt02rg2sepw3kgkstckmzrz4ccfm3j9pqrqkea3tns46e3qy2w42vl8dvvue8u45amzm3rjqvv2nxh" */
  buyer_address?: string
  /** @example 1 */
  extra_fee_pct?: number
  /** @example "" */
  extra_fee_receiver?: string
  /** @example false */
  is_optimized?: boolean
  /** @example "" */
  single_preferred_dex?: ModelsDexName
  /** @example 2 */
  slippage: number
  /** @example "" */
  token_in: string
  /** @example "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454b" */
  token_out: string
}

export interface SwaputilsSplit {
  amount_in?: number
  batcher_fee?: number
  deposits?: number
  dex?: ModelsDexName
  expected_output?: number
  expected_output_without_slippage?: number
  fee?: number
  final_price?: number
  initial_price?: number
  pool_fee?: number
  pool_id?: string
  price_distortion?: number
  price_impact?: number
  t1_amt?: number
  t2_amt?: number
}

export interface SwaputilsSubmissionModel {
  Signatures?: string
  txCbor?: string
}

export interface SwaputilsSwapObject {
  /** @example 1 */
  amount_in: number
  /** @example [""] */
  blacklisted_dexes?: ModelsDexName[]
  /** @example "addr1qxajla3qcrwckzkur8n0lt02rg2sepw3kgkstckmzrz4ccfm3j9pqrqkea3tns46e3qy2w42vl8dvvue8u45amzm3rjqvv2nxh" */
  buyer_address: string
  /** @example [""] */
  inputs?: string[]
  /** @example false */
  is_optimized?: boolean
  /** @example "" */
  referrer?: string
  /** @example "" */
  single_preferred_dex?: ModelsDexName
  /** @example 2 */
  slippage: number
  /** @example "" */
  token_in: string
  /** @example "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454b" */
  token_out: string
}

export interface SwaputilsSwapResponse {
  average_price?: number
  batcher_fee?: number
  cbor?: string
  deposits?: number
  dexhunter_fee?: number
  partner_fee?: number
  possible_routes?: Record<string, number>
  price_ab?: number
  price_ba?: number
  splits?: SwaputilsSplit[]
  total_fee?: number
  total_output?: number
  total_output_without_slippage?: number
}

export interface SwaputilsTrade {
  /** @example 1 */
  amount_in: number
  /** @example ["2"] */
  blacklisted_dexes: ModelsDexName[]
  /** @example 2 */
  slippage: number
  /** @example "" */
  token_in: string
  /** @example "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454b" */
  token_out: string
}

export type QueryParamsType = Record<string | number, any>
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat
  /** request body */
  body?: unknown
  /** base url */
  baseUrl?: string
  /** request cancellation token */
  cancelToken?: CancelToken
}

export type RequestParams = Omit<
  FullRequestParams,
  'body' | 'method' | 'query' | 'path'
>

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void
  customFetch?: typeof fetch
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D
  error: E
}

type CancelToken = Symbol | string | number

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = 'https://dexhunter.sbase.ch'
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private abortControllers = new Map<CancelToken, AbortController>()
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams)

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  }

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig)
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key)
    return `${encodedKey}=${encodeURIComponent(
      typeof value === 'number' ? value : `${value}`,
    )}`
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key])
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key]
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&')
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {}
    const keys = Object.keys(query).filter(
      (key) => 'undefined' !== typeof query[key],
    )
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join('&')
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery)
    return queryString ? `?${queryString}` : ''
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== 'string'
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key]
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        )
        return formData
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  }

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    }
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken)
      if (abortController) {
        return abortController.signal
      }
      return void 0
    }

    const abortController = new AbortController()
    this.abortControllers.set(cancelToken, abortController)
    return abortController.signal
  }

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken)

    if (abortController) {
      abortController.abort()
      this.abortControllers.delete(cancelToken)
    }
  }

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const queryString = query && this.toQueryString(query)
    const payloadFormatter = this.contentFormatters[type || ContentType.Json]
    const responseFormat = format || requestParams.format

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${
        queryString ? `?${queryString}` : ''
      }`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? {'Content-Type': type}
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === 'undefined' || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>
      r.data = null as unknown as T
      r.error = null as unknown as E

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data
              } else {
                r.error = data
              }
              return r
            })
            .catch((e) => {
              r.error = e
              return r
            })

      if (cancelToken) {
        this.abortControllers.delete(cancelToken)
      }

      if (!response.ok) throw data
      return data
    })
  }
}

/**
 * @title DexHunter API
 * @version 1.0
 * @baseUrl https://dexhunter.sbase.ch
 * @contact
 *
 * This is the DexHunter API. All endpoints are encoded: Please generate a partnerCode through the Partner create endpoint and use the partner_header provided as X-Partner-Id on each and every request.
 */
export class DexHunter<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  basket = {
    /**
     * @description Creates a basket
     *
     * @tags basket
     * @name CreateCreate
     * @summary Creates a basket
     * @request POST:/basket/create
     */
    createCreate: (
      body: BasketCreateBasketRequest,
      params: RequestParams = {},
    ) =>
      this.request<string, string>({
        path: `/basket/create`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Deletes a basket
     *
     * @tags basket
     * @name DeleteDelete
     * @summary Deletes a basket
     * @request DELETE:/basket/delete
     */
    deleteDelete: (
      body: BasketDeleteBasketRequest,
      params: RequestParams = {},
    ) =>
      this.request<string, string>({
        path: `/basket/delete`,
        method: 'DELETE',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Estimates a basket
     *
     * @tags basket
     * @name EstimateCreate
     * @summary Estimates a basket
     * @request POST:/basket/estimate
     */
    estimateCreate: (
      body: BasketBasketEstimateRequest,
      params: RequestParams = {},
    ) =>
      this.request<BasketBasketEstimateResponse, string>({
        path: `/basket/estimate`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Gets baskets
     *
     * @tags basket
     * @name PostBasket
     * @summary Gets baskets
     * @request POST:/basket/get
     */
    postBasket: (body: BasketGetBasketsRequest, params: RequestParams = {}) =>
      this.request<BasketGetBasketsResponse, string>({
        path: `/basket/get`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Gets a basket
     *
     * @tags basket
     * @name GetBasket
     * @summary Gets a basket
     * @request GET:/basket/get/{basketId}
     */
    getBasket: (basketId: string, params: RequestParams = {}) =>
      this.request<BasketBasket, string>({
        path: `/basket/get/${basketId}`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Swaps a basket
     *
     * @tags basket
     * @name SwapCreate
     * @summary Swaps a basket
     * @request POST:/basket/swap
     */
    swapCreate: (
      body: BasketTokenBasketSwapRequest,
      params: RequestParams = {},
    ) =>
      this.request<SwaputilsBulkBuyResponse, string>({
        path: `/basket/swap`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Gets the balance of a user for a specific basket
     *
     * @tags basket
     * @name BalanceDetail
     * @summary Gets the balance of a user for a specific basket
     * @request GET:/basket/{basketId}/balance/{address}
     */
    balanceDetail: (
      basketId: string,
      address: string,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, number>, string>({
        path: `/basket/${basketId}/balance/${address}`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  }
  customSwap = {
    /**
     * @description Performs a Swap
     *
     * @tags swap
     * @name CustomSwapCreate
     * @summary Performs a Swap
     * @request POST:/custom-swap
     */
    customSwapCreate: (
      body: SwaputilsCustomSwapObject,
      params: RequestParams = {},
    ) =>
      this.request<SwaputilsSwapResponse, string>({
        path: `/custom-swap`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  }
  dexHunter = {
    /**
     * @description Limit Order
     *
     * @tags dexHunter
     * @name LimitCreate
     * @summary Limit Order
     * @request POST:/dexHunter/limit
     */
    limitCreate: (
      body: DexhunterLimitOrderRequest,
      params: RequestParams = {},
    ) =>
      this.request<DexhunterLimitOrderResponse, any>({
        path: `/dexHunter/limit`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  }
  limit = {
    /**
     * @description Estimate a limit order
     *
     * @tags LimitOrder
     * @name EstimateCreate
     * @summary Estimate a limit order
     * @request POST:/limit/estimate
     */
    estimateCreate: (
      body: DexhunterLimitOrderRequest,
      params: RequestParams = {},
    ) =>
      this.request<DexhunterLimitOrderEstimate, any>({
        path: `/limit/estimate`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  }
  partners = {
    /**
     * @description Create Partner
     *
     * @tags Partners
     * @name CreateCreate
     * @summary Create Partner
     * @request POST:/partners/create
     */
    createCreate: (
      body: PartnersCreatePartnerRequest,
      params: RequestParams = {},
    ) =>
      this.request<ModelsPartnerDeal, any>({
        path: `/partners/create`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns payouts, and various stats for a partner
     *
     * @tags Partners
     * @name PartnersDetail
     * @summary Get Partner
     * @request GET:/partners/{partner}
     */
    partnersDetail: (partner: string, params: RequestParams = {}) =>
      this.request<PartnersPartnerInfos, any>({
        path: `/partners/${partner}`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns a chart of the fees paid to a partner
     *
     * @tags Partners
     * @name ChartDetail
     * @summary Get Partners chart
     * @request GET:/partners/{partner}/chart/{period}
     */
    chartDetail: (
      partner: string,
      period: '1d' | '7d' | '30d',
      params: RequestParams = {},
    ) =>
      this.request<number[], any>({
        path: `/partners/${partner}/chart/${period}`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  }
  stoploss = {
    /**
     * @description Creates a stoploss
     *
     * @tags StopLoss
     * @name StoplossCreate
     * @summary Create a StopLoss
     * @request POST:/stoploss
     */
    stoplossCreate: (
      body: StoplossStopLossCreationRequest,
      params: RequestParams = {},
    ) =>
      this.request<StoplossStopLossResponse, any>({
        path: `/stoploss`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Cancels a stoploss, it is preferred to use the cancel endpoint
     *
     * @tags StopLoss
     * @name CancelCreate
     * @summary Cancel a StopLoss
     * @request POST:/stoploss/cancel
     */
    cancelCreate: (
      body: StoplossCancelStopLossBody,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, string>, any>({
        path: `/stoploss/cancel`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  }
  swap = {
    /**
     * @description Performs a Swap
     *
     * @tags swap
     * @name SwapCreate
     * @summary Performs a Swap
     * @request POST:/swap
     */
    swapCreate: (body: SwaputilsSwapObject, params: RequestParams = {}) =>
      this.request<SwaputilsSwapResponse, string>({
        path: `/swap`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get ADA value
     *
     * @tags Swap
     * @name AdaValueList
     * @summary Get ADA value
     * @request GET:/swap/adaValue
     */
    adaValueList: (params: RequestParams = {}) =>
      this.request<string, any>({
        path: `/swap/adaValue`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns the average price for a token pair
     *
     * @tags swap
     * @name AveragePriceDetail
     * @summary Returns the average price for a token pair
     * @request GET:/swap/averagePrice/{tokenIn}/{tokenOut}
     */
    averagePriceDetail: (
      tokenIn: string,
      tokenOut: string,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, number>, string>({
        path: `/swap/averagePrice/${tokenIn}/${tokenOut}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Bulk swap
     *
     * @tags Swap
     * @name BulkCreate
     * @summary Bulk swap
     * @request POST:/swap/bulk
     */
    bulkCreate: (body: DexhunterBulkBuyBody, params: RequestParams = {}) =>
      this.request<SwaputilsBulkBuyResponse, any>({
        path: `/swap/bulk`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Performs a bulk cancel
     *
     * @tags cancel
     * @name BulkcancelCreate
     * @summary Performs a bulk cancel
     * @request POST:/swap/bulkcancel
     */
    bulkcancelCreate: (
      body: DexhunterBulkCancelRequest,
      params: RequestParams = {},
    ) =>
      this.request<DexhunterCancelResponse, string>({
        path: `/swap/bulkcancel`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Performs a cancel
     *
     * @tags cancel
     * @name CancelCreate
     * @summary Performs a cancel
     * @request POST:/swap/cancel
     */
    cancelCreate: (body: DexhunterCancelRequest, params: RequestParams = {}) =>
      this.request<DexhunterCancelResponse, string>({
        path: `/swap/cancel`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Performs an Estimate
     *
     * @tags estimate
     * @name EstimateCreate
     * @summary Performs an Estimate
     * @request POST:/swap/estimate
     */
    estimateCreate: (
      body: SwaputilsEstimationRequest,
      params: RequestParams = {},
    ) =>
      this.request<SwaputilsEstimationResponse, string>({
        path: `/swap/estimate`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns orders filtered and sorted
     *
     * @tags swap
     * @name GlobalOrdersCreate
     * @summary Returns orders filtered and sorted
     * @request POST:/swap/globalOrders
     */
    globalOrdersCreate: (
      body: ModelsGlobalOrdersRequest,
      params: RequestParams = {},
    ) =>
      this.request<DexhunterOrdersByPair, any>({
        path: `/swap/globalOrders`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns orders filtered and sorted
     *
     * @tags swap
     * @name OrdersCreate
     * @summary Returns orders filtered and sorted
     * @request POST:/swap/orders/{userAddress}
     */
    ordersCreate: (
      userAddress: string,
      body: ModelsOrderRequest,
      params: RequestParams = {},
    ) =>
      this.request<ModelsOrder[], any>({
        path: `/swap/orders/${userAddress}`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns orders filtered and sorted
     *
     * @tags swap
     * @name OrdersByPairDetail
     * @summary Returns orders filtered and sorted
     * @request GET:/swap/ordersByPair/{tokenIn}/{tokenOut}
     */
    ordersByPairDetail: (
      tokenIn: string,
      tokenOut: string,
      params: RequestParams = {},
    ) =>
      this.request<DexhunterOrdersByPair, any>({
        path: `/swap/ordersByPair/${tokenIn}/${tokenOut}`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns stats for a token pair
     *
     * @tags swap
     * @name PairStatsDetail
     * @summary Returns stats for a token pair
     * @request GET:/swap/pairStats/{tokenIn}/{tokenOut}
     */
    pairStatsDetail: (
      tokenIn: string,
      tokenOut: string,
      params: RequestParams = {},
    ) =>
      this.request<SwaputilsPairStats, string>({
        path: `/swap/pairStats/${tokenIn}/${tokenOut}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns the number of pending orders for a user
     *
     * @tags swap
     * @name PendingOrdersDetail
     * @summary Returns the number of pending orders for a user
     * @request GET:/swap/pendingOrders/{address}
     */
    pendingOrdersDetail: (address: string, params: RequestParams = {}) =>
      this.request<number, string>({
        path: `/swap/pendingOrders/${address}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Performs an Estimate
     *
     * @tags estimate
     * @name ReverseEstimateCreate
     * @summary Performs an Estimate
     * @request POST:/swap/reverseEstimate
     */
    reverseEstimateCreate: (
      body: SwaputilsReverseEstimationRequest,
      params: RequestParams = {},
    ) =>
      this.request<SwaputilsEstimationResponse, string>({
        path: `/swap/reverseEstimate`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Signs a transaction
     *
     * @tags swap
     * @name SignCreate
     * @summary Signs a transaction
     * @request POST:/swap/sign
     */
    signCreate: (body: SwaputilsSubmissionModel, params: RequestParams = {}) =>
      this.request<DexhunterSignatureResponse, string>({
        path: `/swap/sign`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns all supported dexes
     *
     * @tags swap
     * @name SupportedDexesList
     * @summary Returns all supported dexes
     * @request GET:/swap/supportedDexes
     */
    supportedDexesList: (params: RequestParams = {}) =>
      this.request<string[], any>({
        path: `/swap/supportedDexes`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns a token
     *
     * @tags swap
     * @name TokenDetail
     * @summary Returns a token
     * @request GET:/swap/token/{tokenId}
     */
    tokenDetail: (tokenId: string, params: RequestParams = {}) =>
      this.request<ModelsToken, string>({
        path: `/swap/token/${tokenId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns a token image
     *
     * @tags swap
     * @name TokenImageDetail
     * @summary Returns a token image
     * @request GET:/swap/token/{tokenId}/image
     */
    tokenImageDetail: (tokenId: string, params: RequestParams = {}) =>
      this.request<string, string>({
        path: `/swap/token/${tokenId}/image`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns all tokens
     *
     * @tags swap
     * @name TokensList
     * @summary Returns all tokens
     * @request GET:/swap/tokens
     */
    tokensList: (params: RequestParams = {}) =>
      this.request<ModelsTokenInfo[], any>({
        path: `/swap/tokens`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns trending tokens
     *
     * @tags swap
     * @name TrendingCreate
     * @summary Returns trending tokens
     * @request POST:/swap/trending
     */
    trendingCreate: (
      body: DexhunterTrendingTokensRequest,
      params: RequestParams = {},
    ) =>
      this.request<DexhunterTrendingTokensResponse, any>({
        path: `/swap/trending`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns the balance for a user
     *
     * @tags swap
     * @name UserBalanceDetail
     * @summary Returns the balance for a user
     * @request GET:/swap/userBalance/{address}
     */
    userBalanceDetail: (address: string, params: RequestParams = {}) =>
      this.request<Record<string, number>, string>({
        path: `/swap/userBalance/${address}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns all tokens for a user
     *
     * @tags swap
     * @name UserTokensDetail
     * @summary Returns all tokens for a user
     * @request GET:/swap/userTokens/{address}
     */
    userTokensDetail: (address: string, params: RequestParams = {}) =>
      this.request<ModelsUserToken[], string>({
        path: `/swap/userTokens/${address}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns the wallet info
     *
     * @tags wallet
     * @name WalletCreate
     * @summary Returns the wallet info
     * @request POST:/swap/wallet
     */
    walletCreate: (body: DexhunterWalletInfo, params: RequestParams = {}) =>
      this.request<DexhunterWalletInfoResponse, string>({
        path: `/swap/wallet`,
        method: 'POST',
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  }
}
