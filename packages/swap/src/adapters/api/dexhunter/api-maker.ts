import {FetchData, fetchData, isLeft} from '@yoroi/common'
import {Api, Chain, Left, Portfolio, Swap} from '@yoroi/types'
import {freeze} from 'immer'
import {
  CancelResponse,
  EstimateResponse,
  LimitEstimateResponse,
  LimitBuildResponse,
  OrdersResponse,
  ReverseEstimateResponse,
  BuildResponse,
  TokensResponse,
} from './types'
import {transformersMaker} from './transformers'

export type DexhunterApiConfig = {
  address: string
  primaryTokenInfo: Portfolio.Token.Info
  partnerId?: string
  partnerCode?: string
  network: Chain.SupportedNetworks
  request?: FetchData
}
export const dexhunterApiMaker = (
  config: DexhunterApiConfig,
): Readonly<Swap.Api> => {
  const {address, partnerId, network, request = fetchData} = config

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
                  message: 'Dexhunter api only works on mainnet',
                },
              },
              true,
            )
        },
      },
    ) as Swap.Api

  const baseUrl = baseUrls[network]

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(partnerId && {'X-Partner-Id': partnerId}),
  }

  const transformers = transformersMaker(config)

  return freeze(
    {
      async tokens() {
        const response = await request<TokensResponse>({
          method: 'get',
          url: `${baseUrl}${apiPaths.tokens}`,
          headers,
        })

        if (isLeft(response)) return parseDhError(response)

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
        const response = await request<OrdersResponse>({
          method: 'get',
          url: `${baseUrl}${apiPaths.orders({address})}`,
          headers,
        })

        if (isLeft(response)) return parseDhError(response)

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

      async providers(_body: Swap.ProvidersRequest) {
        return freeze(
          {
            tag: 'right',
            value: {
              status: 200,
              data: transformers.providers.response(),
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

        const response = await request<
          EstimateResponse | ReverseEstimateResponse | LimitEstimateResponse
        >({
          method: 'post',
          url: `${baseUrl}${apiPaths[kind]}`,
          headers,
          data: transformers[kind].request(body),
        })

        if (isLeft(response)) return parseDhError(response)

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

      async create(body: Swap.CreateRequest) {
        const kind: 'build' | 'limitBuild' =
          body.wantedPrice !== undefined ? 'limitBuild' : 'build'

        const response = await request<BuildResponse | LimitBuildResponse>({
          method: 'post',
          url: `${baseUrl}${apiPaths[kind]}`,
          headers,
          data: transformers[kind].request(body),
        })

        if (isLeft(response)) return parseDhError(response)

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
        const response = await request<CancelResponse>({
          method: 'post',
          url: `${baseUrl}${apiPaths.cancel}`,
          headers,
          data: transformers.cancel.request(body),
        })

        if (isLeft(response)) return parseDhError(response)

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

const parseDhError = ({
  tag,
  error,
}: Left<Api.ResponseError>): Left<Api.ResponseError> => ({
  tag,
  error: {
    ...error,
    message: JSON.stringify(error.responseData as any, null, 2),
  },
})

const baseUrls = {
  [Chain.Network.Mainnet]: 'https://api-us.dexhunterv3.app',
} as const

const apiPaths = {
  tokens: '/swap/tokens',
  orders: ({address}: {address: string}) => `/swap/orders/${address}`,

  cancel: '/swap/cancel',
  estimate: '/swap/estimate',
  limitBuild: '/swap/limit/build',
  limitEstimate: '/swap/limit/estimate',
  reverseEstimate: '/swap/reverseEstimate',
  build: '/swap/build',
  sign: '/swap/sign',
} as const
