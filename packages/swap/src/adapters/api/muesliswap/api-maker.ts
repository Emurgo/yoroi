import {FetchData, fetchData, isLeft} from '@yoroi/common'
import {Api, Chain, Left, Portfolio, Swap} from '@yoroi/types'
import {freeze} from 'immer'

import {
  CancelRequest,
  CancelResponse,
  OrdersHistoryResponse,
  TokensResponse,
  CreateOrderResponse,
  QuoteResponse,
  LimitOrderResponse,
  LimitQuoteResponse,
} from './types'
import {transformersMaker} from './transformers'

export type MuesliswapApiConfig = {
  addressHex: string
  address: string
  primaryTokenInfo: Portfolio.Token.Info
  isPrimaryToken: (token: string | null | undefined) => boolean
  stakingKey: string
  network: Chain.SupportedNetworks
  request?: FetchData
}
export const muesliswapApiMaker = (
  config: MuesliswapApiConfig,
): Readonly<Swap.Api> => {
  const {address, network, request = fetchData} = config

  if (network !== Chain.Network.Mainnet)
    return new Proxy(
      {},
      {
        get() {
          return () =>
            freeze(
              {
                tag: 'left',
                error: {
                  status: -3,
                  message: 'Muesliswap api only works on mainnet',
                },
              },
              true,
            )
        },
      },
    ) as Swap.Api

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const baseUrl = baseUrls[network]

  const transformers = transformersMaker(config)

  return freeze(
    {
      async tokens() {
        const response = await request<TokensResponse>({
          method: 'get',
          url: `${baseUrl}${apiPaths.tokens}`,
          headers,
        })

        if (isLeft(response)) return parseMuesliError(response)

        return freeze(
          {
            tag: 'right',
            value: {
              status: response.value.status,
              data: transformers.tokens.response(response.value.data),
            },
          },
          true,
        )
      },

      async orders() {
        const response = await request<OrdersHistoryResponse>(
          {
            method: 'get',
            url: `${baseUrl}${apiPaths.orderHistory}`,
            headers,
          },
          {
            params: {
              user_address: address,
              numbers_have_decimals: true,
            },
          },
        )

        if (isLeft(response)) return parseMuesliError(response)

        try {
          return freeze(
            {
              tag: 'right',
              value: {
                status: 200,
                data: transformers.ordersHistory.response(response.value.data),
              },
            },
            true,
          )
        } catch (e) {
          return freeze(
            {
              tag: 'left',
              error: {
                status: -3,
                message: 'Failed to transform orderHistory',
                responseData: response.value.data,
              },
            },
            true,
          )
        }
      },

      async protocols() {
        return freeze(
          {
            tag: 'right',
            value: {
              status: Api.HttpStatusCode.Ok,
              data: transformers.protocols.response(),
            },
          },
          true,
        )
      },

      async estimate(body: Swap.EstimateRequest) {
        const kind: 'quote' | 'limitQuote' =
          body.wantedPrice !== undefined ? 'limitQuote' : 'quote'

        const params = transformers[kind].request(body)

        const response = await request<QuoteResponse | LimitQuoteResponse>(
          {
            method: 'post',
            url: `${baseUrl}${apiPaths[kind]}`,
            headers,
          },
          {
            params,
          },
        )

        if (isLeft(response)) return parseMuesliError(response)

        try {
          return freeze(
            {
              tag: 'right',
              value: {
                status: response.value.status,
                data: transformers.quote.response(response.value.data),
              },
            },
            true,
          )
        } catch (e) {
          return freeze(
            {
              tag: 'left',
              error: {
                status: -3,
                message: 'No liquidity pools satisfy the estimate requirements',
                responseData: response.value.data,
              },
            },
            true,
          )
        }
      },

      async create(body: Swap.CreateRequest) {
        const kind: 'create' | 'createLimit' =
          body.wantedPrice !== undefined ? 'createLimit' : 'create'

        const params = transformers[kind].request(body)
        const response = await request<
          CreateOrderResponse | LimitOrderResponse
        >(
          {
            method: 'post',
            url: `${baseUrl}${apiPaths[kind]}`,
            headers,
          },
          {
            params,
          },
        )

        if (isLeft(response)) return parseMuesliError(response)

        return freeze(
          {
            tag: 'right',
            value: {
              status: response.value.status,
              data: transformers[kind].response(response.value.data as any),
            },
          },
          true,
        )
      },

      async cancel(body: Swap.CancelRequest) {
        const params: CancelRequest = transformers.cancel.request(body)

        const response = await request<CancelResponse>(
          {
            method: 'post',
            url: `${baseUrl}${apiPaths.cancel}`,
            headers,
          },
          {
            params,
          },
        )

        if (isLeft(response)) return parseMuesliError(response)

        return freeze(
          {
            tag: 'right',
            value: {
              status: response.value.status,
              data: transformers.cancel.response(response.value.data),
            },
          },
          true,
        )
      },
    },
    true,
  )
}

const parseMuesliError = ({tag, error}: Left<Api.ResponseError>) =>
  freeze<Left<Api.ResponseError>>(
    {
      tag,
      error: {
        ...error,
        message: JSON.stringify((error.responseData as any)?.detail, null, 2)
          .replace(/^"/, '')
          .replace(/"$/, ''),
      },
    },
    true,
  )

const baseUrls = freeze({
  [Chain.Network.Mainnet]: 'https://aggregator-v2.muesliswap.com',
} as const)

const apiPaths = freeze({
  tokens: '/tokens',
  orderHistory: '/order_history',
  openOrders: '/open_orders',
  quote: '/quote',
  limitQuote: '/limit_order_quote',
  create: '/order',
  createLimit: '/limit_order',
  cancel: '/cancel',
  pools: '/pools',
  providers: '/providers',
} as const)
