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

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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

        try {
          const response = await request<TokensResponse>({
            method: 'post',
            url: `${baseUrl}/tokens`,
            headers,
            data: requestBody,
          })

          if (isLeft(response)) return parseMinswapError(response)

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
        } catch (error) {
          return freeze<Left<Api.ResponseError>>(
            {
              tag: 'left',
              error: {
                status: -1,
                message:
                  error instanceof Error ? error.message : 'Network error',
                responseData: null,
              },
            },
            true,
          )
        }
      },

      async orders() {
        try {
          const response = await request<PendingOrdersResponse>({
            method: 'get',
            url: `${baseUrl}/pending-orders?owner_address=${address}&amount_in_decimal=true`,
            headers,
          })

          if (isLeft(response)) return parseMinswapError(response)

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
        } catch (error) {
          return freeze<Left<Api.ResponseError>>(
            {
              tag: 'left',
              error: {
                status: -1,
                message:
                  error instanceof Error ? error.message : 'Network error',
                responseData: null,
              },
            },
            true,
          )
        }
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

        try {
          const response = await request<EstimateResponse>({
            method: 'post',
            url: `${baseUrl}/estimate`,
            headers,
            data: requestBody,
          })

          if (isLeft(response)) return parseMinswapError(response)

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
        } catch (error) {
          return freeze<Left<Api.ResponseError>>(
            {
              tag: 'left',
              error: {
                status: -1,
                message:
                  error instanceof Error ? error.message : 'Network error',
                responseData: null,
              },
            },
            true,
          )
        }
      },

      async create(body: Swap.CreateRequest) {
        const requestBody = transformers.create.request(body)

        // Make the build-tx call
        let response: Api.Response<CreateResponse>
        try {
          response = await request<CreateResponse>({
            method: 'post',
            url: `${baseUrl}/build-tx`,
            headers,
            data: requestBody,
          })
        } catch (error) {
          return freeze<Left<Api.ResponseError>>(
            {
              tag: 'left',
              error: {
                status: -1,
                message:
                  error instanceof Error ? error.message : 'Network error',
                responseData: null,
              },
            },
            true,
          )
        }

        if (isLeft(response)) return parseMinswapError(response)

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

        try {
          const response = await request<CancelResponse>({
            method: 'post',
            url: `${baseUrl}/cancel-tx`,
            headers,
            data: requestBody,
          })

          if (isLeft(response)) return parseMinswapError(response)

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
        } catch (error) {
          return freeze<Left<Api.ResponseError>>(
            {
              tag: 'left',
              error: {
                status: -1,
                message:
                  error instanceof Error ? error.message : 'Network error',
                responseData: null,
              },
            },
            true,
          )
        }
      },
    },
    true,
  )
}

const parseMinswapError = ({tag, error}: Left<Api.ResponseError>) =>
  freeze<Left<Api.ResponseError>>(
    {
      tag,
      error: {
        ...error,
        message:
          typeof (error.responseData as any)?.message === 'string'
            ? (error.responseData as any).message
            : error.message || 'Minswap API error',
      },
    },
    true,
  )
