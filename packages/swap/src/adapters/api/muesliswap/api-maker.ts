import {FetchData, fetchData, isLeft} from '@yoroi/common'
import {Chain, Portfolio, Swap} from '@yoroi/types'
import {freeze} from 'immer'
import {
  CancelRequest,
  CancelResponse,
  HistoryOrdersResponse,
  TokensResponse,
  CreateOrderResponse,
  QuoteResponse,
  LimitOrderResponse,
} from './types'
import {transformersMaker} from './transformers'

export type MuesliswapApiConfig = {
  addressHex: string
  address: string
  primaryTokenInfo: Portfolio.Token.Info
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

  const transformers = transformersMaker(config)

  return freeze(
    {
      async tokens() {
        const response = await request<TokensResponse>({
          method: 'get',
          url: apiUrls.tokens,
          headers,
        })

        if (isLeft(response)) return response

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
        const response = await request<HistoryOrdersResponse>(
          {
            method: 'get',
            url: apiUrls.orderHistory,
            headers,
          },
          {
            params: {
              user_address: address,
            },
          },
        )

        if (isLeft(response)) return response

        return freeze(
          {
            tag: 'right',
            value: {
              status: 200,
              data: transformers.orderHistory.response(response.value.data),
            },
          },
          true,
        )
      },

      async estimate(body: Swap.EstimateRequest) {
        const params = transformers.quote.request(body)

        const response = await request<QuoteResponse>(
          {
            method: 'get',
            url: apiUrls.create,
            headers,
          },
          {
            params,
          },
        )

        if (isLeft(response)) return response

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
        } finally {
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
            method: 'get',
            url: apiUrls[kind],
            headers,
          },
          {
            params,
          },
        )

        if (isLeft(response)) return response

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
            url: apiUrls.cancel,
            headers,
          },
          {
            params,
          },
        )

        if (isLeft(response)) return response

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

const apiUrls = {
  tokens: 'https://api.muesliswap.com/list',
  orderHistory: 'https://aggregator-v2.muesliswap.com/order_history',
  openOrders: 'https://aggregator-v2.muesliswap.com/open_orders',
  quote: 'https://aggregator-v2.muesliswap.com/quote',
  create: 'https://aggregator-v2.muesliswap.com/order',
  createLimit: 'https://aggregator-v2.muesliswap.com/limit_order',
  cancel: 'https://aggregator-v2.muesliswap.com/cancel',
} as const
