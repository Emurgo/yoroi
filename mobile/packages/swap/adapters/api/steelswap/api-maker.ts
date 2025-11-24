import {fetchData, isLeft} from '@yoroi/common'
import {Api, Chain, Left, Swap} from '@yoroi/types'

import {freeze} from 'immer'

import {transformersMaker} from './transformers'
import {
  BuildSwapResponse,
  CancelResponse,
  EstimateResponse,
  OrderStatusResponse,
  SteelswapApiConfig,
  SwapHistoryRequest,
  TokensResponse,
} from './types'

export const steelswapApiMaker = (
  config: SteelswapApiConfig,
): Readonly<Swap.Api> => {
  const {address, network, request = fetchData} = config

  if (network !== Chain.Network.Mainnet)
    return new Proxy(
      {},
      {
        get() {
          return () =>
            Promise.resolve(
              freeze(
                {
                  tag: 'left',
                  error: {
                    status: -3,
                    message: 'Steelswap api only works on mainnet',
                  },
                },
                true,
              ),
            )
        },
      },
    ) as Swap.Api

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'token':
      'yoroi-xEwoVRkAcYSn4fgxsx5kS2ZJRBxPzAe15GyyG8FZVJEgn7e9UHfVZ07FwUBUAbmM',
  }

  const baseUrl = baseUrls[network]

  const transformers = transformersMaker({
    ...config,
  })

  const api = freeze(
    {
      async tokens() {
        const response = await request<TokensResponse>({
          method: 'get',
          url: `${baseUrl}${apiPaths.tokens}`,
          headers,
        })

        if (isLeft(response)) return parseSteelswapError(response)

        return freeze(
          {
            tag: 'right' as const,
            value: {
              status: response.value.status,
              data: transformers.tokens.response(response.value.data),
            },
          },
          true,
        )
      },

      async orders() {
        const requestBody: SwapHistoryRequest = {
          addresses: [address],
          txType: ['swap'],
          page: 0,
          pageSize: 100,
          isFloat: true,
        }

        const response = await request<OrderStatusResponse>({
          method: 'post',
          url: `${baseUrl}${apiPaths.orders}`,
          headers,
          data: requestBody,
        })

        if (isLeft(response)) return parseSteelswapError(response)

        try {
          return freeze(
            {
              tag: 'right' as const,
              value: {
                status: 200,
                data: transformers.orders
                  .response(response.value.data)
                  .sort(
                    (
                      {lastUpdate: A, placedAt: A2},
                      {lastUpdate: B, placedAt: B2},
                    ) => (B ?? B2 ?? 0) - (A ?? A2 ?? 0),
                  ),
              },
            },
            true,
          )
        } catch (e) {
          return freeze(
            {
              tag: 'left' as const,
              error: {
                status: -3,
                message: 'Failed to transform orders',
                responseData: response.value.data,
              },
            },
            true,
          )
        }
      },

      async limitOptions() {
        return freeze<Left<Api.ResponseError>>(
          {
            tag: 'left',
            error: {
              status: -3,
              message: 'Limit options not supported',
              responseData: null,
            },
          },
          true,
        )
      },

      async estimate(body: Swap.EstimateRequest) {
        // Reject limit estimates (wantedPrice) - not supported
        if (body.wantedPrice !== undefined) {
          return freeze({
            tag: 'left' as const,
            error: {
              status: -1,
              message: 'Steelswap Aggregator only supports market',
              responseData: null,
            },
          })
        }

        const requestBody = transformers.estimate.request(body)

        const response = await request<EstimateResponse>({
          method: 'post',
          url: `${baseUrl}${apiPaths.estimate}`,
          headers,
          data: requestBody,
        })

        if (isLeft(response)) return parseSteelswapError(response)

        try {
          return freeze(
            {
              tag: 'right' as const,
              value: {
                status: response.value.status,
                data: transformers.estimate.response(response.value.data),
              },
            },
            true,
          )
        } catch (e) {
          return freeze(
            {
              tag: 'left' as const,
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
        const requestBody = transformers.create.request(body)

        const response = await request<BuildSwapResponse>({
          method: 'post',
          url: `${baseUrl}${apiPaths.create}`,
          headers,
          data: requestBody,
        })

        if (isLeft(response)) return parseSteelswapError(response)

        // Make an estimate call to get the swap details (build endpoint doesn't return splits)
        const estimateRequest: Swap.EstimateRequest = {
          amountIn: body.amountIn,
          tokenIn: body.tokenIn,
          tokenOut: body.tokenOut,
          slippage: body.slippage ?? 0,
          blockedProtocols: body.blockedProtocols,
          protocol: body.protocol,
        }

        const estimateResponse = await this.estimate(estimateRequest)

        // If estimate fails, return the create response with minimal data
        if (isLeft(estimateResponse)) {
          return freeze(
            {
              tag: 'right' as const,
              value: {
                status: response.value.status,
                data: transformers.create.response(response.value.data),
              },
            },
            true,
          )
        }

        // Merge the CBOR from create with the estimate data
        const estimateData = estimateResponse.value.data
        const mergedData: Swap.CreateResponse = {
          ...estimateData,
          cbor: response.value.data.tx,
          aggregator: Swap.Aggregator.Steelswap,
          totalInput: estimateData.totalInput ?? body.amountIn,
        }

        return freeze(
          {
            tag: 'right' as const,
            value: {
              status: response.value.status,
              data: mergedData,
            },
          },
          true,
        )
      },

      async cancel(body: Swap.CancelRequest) {
        const requestBody = transformers.cancel.request(body)

        const response = await request<CancelResponse>({
          method: 'post',
          url: `${baseUrl}${apiPaths.cancel}`,
          headers,
          data: requestBody,
        })

        if (isLeft(response)) return parseSteelswapError(response)

        return freeze(
          {
            tag: 'right' as const,
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

  return api
}

type ValidationError = {
  loc: Array<string | number>
  msg: string
  type: string
}

type ErrorResponse = {
  detail: string | Array<ValidationError>
}

export const parseSteelswapError = ({tag, error}: Left<Api.ResponseError>) => {
  const responseData = error.responseData as ErrorResponse | null
  let message = 'Steelswap API error'

  if (responseData) {
    if (typeof responseData.detail === 'string') {
      message = responseData.detail
    } else if (Array.isArray(responseData.detail)) {
      message = responseData.detail
        .map((err) => `${err.loc.join('.')}: ${err.msg}`)
        .join('; ')
    }
  }

  return freeze<Left<Api.ResponseError>>(
    {
      tag,
      error: {
        ...error,
        message,
      },
    },
    true,
  )
}

const baseUrls = freeze({
  [Chain.Network.Mainnet]: 'https://yoroi.steelswap.io',
} as const)

const apiPaths = freeze({
  tokens: '/tokens/list/',
  orders: '/wallet/history/',
  estimate: '/swap/estimate/',
  create: '/swap/build/',
  cancel: '/swap/cancel/',
} as const)
