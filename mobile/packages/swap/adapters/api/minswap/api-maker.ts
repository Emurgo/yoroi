import {fetchData, isLeft} from '@yoroi/common'
import {Api, Chain, Swap} from '@yoroi/types'

import {freeze} from 'immer'

import {transformersMaker} from './transformers'
import {
  CancelRequest,
  CancelResponse,
  CreateRequest,
  CreateResponse,
  Dex,
  EstimateRequest,
  EstimateResponse,
  LimitOptionsRequest,
  LimitOptionsResponse,
  MinswapApiConfig,
  PendingOrdersResponse,
  TokensRequest,
  TokensResponse,
} from './types'

const baseUrls = {
  [Chain.Network.Mainnet]: 'https://agg-api.minswap.org/aggregator',
} as const

const mapProtocolToDex = (protocol: Swap.Protocol): Dex => {
  switch (protocol) {
    case Swap.Protocol.Minswap_v2:
      return Dex.MinswapV2
    case Swap.Protocol.Minswap_v1:
      return Dex.Minswap
    case Swap.Protocol.Minswap_stable:
      return Dex.MinswapStable
    case Swap.Protocol.Muesliswap:
      return Dex.MuesliSwap
    case Swap.Protocol.Splash_v1:
      return Dex.Splash
    case Swap.Protocol.Sundaeswap_v3:
      return Dex.SundaeSwapV3
    case Swap.Protocol.Sundaeswap_v1:
      return Dex.SundaeSwap
    case Swap.Protocol.Vyfi_v1:
      return Dex.VyFinance
    case Swap.Protocol.Cswap:
      return Dex.CswapV1
    case Swap.Protocol.Wingriders_v2:
      return Dex.WingRidersV2
    case Swap.Protocol.Wingriders_v1:
      return Dex.WingRiders
    case Swap.Protocol.Wingriders_stable:
      return Dex.WingRidersStableV2
    case Swap.Protocol.Spectrum_v1:
      return Dex.Spectrum
    default:
      return Dex.Unsupported
  }
}

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
            freeze(
              {
                tag: 'left',
                error: {
                  status: -3,
                  message: 'Minswap api only works on mainnet',
                },
              },
              true,
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

      async limitOptions(body: Swap.LimitOptionsRequest) {
        const requestBody: LimitOptionsRequest = {
          token_in: body.tokenIn,
          token_out: body.tokenOut,
          amount_in: '1', // Default amount for limit options
          amount_out: '1', // Default amount for limit options
        }

        const response = await requestWithErrorHandling<LimitOptionsResponse>(
          `${baseUrl}/limit-options`,
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
              data: transformers.limitOptions.response(response.value.data),
            },
          },
          true,
        )
      },

      async estimate(body: Swap.EstimateRequest) {
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

        const response = await requestWithErrorHandling<CreateResponse>(
          `${baseUrl}/create`,
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
              data: transformers.create.response(response.value.data),
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
