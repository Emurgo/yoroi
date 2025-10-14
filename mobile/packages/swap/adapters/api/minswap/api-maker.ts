import {fetchData, isLeft} from '@yoroi/common'
import {Api, Chain, Left, Swap} from '@yoroi/types'

import {freeze} from 'immer'

import {transformersMaker} from './transformers'
import {
  CancelRequest,
  CancelResponse,
  CreateResponse,
  EstimateResponse,
  MinswapApiConfig,
  PendingOrdersResponse,
  TokensRequest,
  TokensResponse,
} from './types'

const baseUrls = {
  [Chain.Network.Mainnet]: 'https://agg-api.minswap.org/aggregator',
} as const

export const minswapApiMaker = (
  config: MinswapApiConfig,
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
                    message: 'Minswap api only works on mainnet',
                  },
                },
                true,
              ),
            )
        },
      },
    ) as Swap.Api

  const baseUrl = baseUrls[network]
  const transformers = transformersMaker(config)

  const requestWithErrorHandling = async <T>(
    url: string,
    options: RequestInit = {},
  ): Promise<Api.Response<T>> => {
    try {
      const response = await request({
        url,
        method: (options.method === 'POST' ? 'post' : 'get') as
          | 'get'
          | 'post'
          | 'put'
          | 'delete',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        data: options.body,
      })

      if (isLeft(response)) return response

      return freeze(
        {
          tag: 'right',
          value: {
            status: response.value.status,
            data: response.value.data as T,
          },
        },
        true,
      )
    } catch (error) {
      return freeze(
        {
          tag: 'left',
          error: {
            status: -1,
            message: error instanceof Error ? error.message : 'Unknown error',
            responseData: {},
          },
        },
        true,
      )
    }
  }

  return freeze(
    {
      async tokens() {
        const requestBody: TokensRequest = {
          query: '',
          only_verified: true,
          page: 1,
          limit: 1000,
        }

        const response = await requestWithErrorHandling<TokensResponse>(
          `${baseUrl}/tokens`,
          {
            method: 'POST',
            body: JSON.stringify(requestBody),
          },
        )

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
        const response = await requestWithErrorHandling<PendingOrdersResponse>(
          `${baseUrl}/pending-orders?owner_address=${address}&amount_in_decimal=true`,
        )

        if (isLeft(response)) return response

        return freeze(
          {
            tag: 'right',
            value: {
              status: response.value.status,
              data: transformers.orders.response(response.value.data),
            },
          },
          true,
        )
      },

      async limitOptions() {
        // Minswap Aggregator doesn't support limit swaps yet
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
        const kind: 'estimate' | 'reverseEstimate' | 'limitEstimate' =
          body.wantedPrice !== undefined
            ? 'limitEstimate'
            : body.amountOut !== undefined
              ? 'reverseEstimate'
              : 'estimate'

        if (kind !== 'estimate') {
          return freeze({
            tag: 'left',
            error: {
              status: -1,
              message:
                kind === 'reverseEstimate'
                  ? 'Set input amount'
                  : 'Minswap Aggregator only supports market',
              responseData: null,
            },
          })
        }

        const requestBody = transformers.estimate.request(body)

        const response = await requestWithErrorHandling<EstimateResponse>(
          `${baseUrl}/estimate`,
          {
            method: 'POST',
            body: JSON.stringify(requestBody),
          },
        )

        if (isLeft(response)) return response

        return freeze(
          {
            tag: 'right',
            value: {
              status: response.value.status,
              data: transformers.estimate.response(response.value.data),
            },
          },
          true,
        )
      },

      async create(body: Swap.CreateRequest) {
        const requestBody = transformers.create.request(body)

        // Make the build-tx call
        const response = await requestWithErrorHandling<CreateResponse>(
          `${baseUrl}/build-tx`,
          {
            method: 'POST',
            body: JSON.stringify(requestBody),
          },
        )

        if (isLeft(response)) return response

        // Make an ad-hoc estimate call to get the swap details
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
              tag: 'right',
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
          cbor: response.value.data.cbor,
          aggregator: Swap.Aggregator.Minswap,
          totalInput: estimateData.totalInput ?? body.amountIn,
        }

        return freeze(
          {
            tag: 'right',
            value: {
              status: response.value.status,
              data: mergedData,
            },
          },
          true,
        )
      },

      async cancel(body: Swap.CancelRequest) {
        const requestBody: CancelRequest = {
          sender: address,
          orders: [
            {
              tx_in: `${body.order.txHash}#${body.order.outputIndex}`,
              protocol: body.order.protocol as any,
            },
          ],
        }

        const response = await requestWithErrorHandling<CancelResponse>(
          `${baseUrl}/cancel-tx`,
          {
            method: 'POST',
            body: JSON.stringify(requestBody),
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
