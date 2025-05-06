import {
  FetchData,
  fetchData,
  isLeft,
  isNonNullable,
  isRight,
} from '@yoroi/common'
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
import {DexhunterProtocols, transformersMaker} from './transformers'

export type DexhunterApiConfig = {
  address: string
  primaryTokenInfo: Portfolio.Token.Info
  isPrimaryToken: (token: string | null | undefined) => boolean
  partner?: string
  network: Chain.SupportedNetworks
  request?: FetchData
}

export const dexhunterApiMaker = (
  config: DexhunterApiConfig,
): Readonly<Swap.Api> => {
  const {
    address,
    partner,
    network,
    isPrimaryToken,
    request = fetchData,
  } = config

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
    ...(partner && {'X-Partner-Id': partner}),
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
      },

      /* istanbul ignore next */
      async limitOptions({tokenIn, tokenOut}: Swap.LimitOptionsRequest) {
        const estimateResponse = await this.estimate({
          tokenIn,
          tokenOut,
          slippage: 0,
          amountIn: 50,
        })

        if (isLeft(estimateResponse)) return parseDhError(estimateResponse)

        const wantedPrice = estimateResponse.value.data.netPrice
        const defaultProtocol = estimateResponse.value.data.splits[0]?.protocol

        if (defaultProtocol === undefined)
          return freeze<Left<Api.ResponseError>>(
            {
              tag: 'left',
              error: {
                status: -3,
                message: 'Invalid state',
                responseData: null,
              },
            },
            true,
          )

        const options = (
          await Promise.all(
            DexhunterProtocols.map((protocol) =>
              this.estimate({
                tokenIn,
                tokenOut,
                slippage: 0,
                amountIn: 50,
                wantedPrice,
                protocol,
              }),
            ),
          )
        )
          .filter(isRight)
          .map((res) => {
            const split = res.value.data.splits[0]
            if (split === undefined) return null
            const {protocol, initialPrice, batcherFee} = split

            return {
              protocol,
              initialPrice,
              batcherFee,
            }
          })
          .filter(isNonNullable)

        return freeze(
          {
            tag: 'right',
            value: {
              status: Api.HttpStatusCode.Ok,
              data: {
                defaultProtocol,
                wantedPrice,
                options,
              },
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
              data: transformers[kind].response(
                response.value.data as any,
                isPrimaryToken(body.tokenIn),
              ),
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
              data: transformers[kind].response(
                response.value.data as any,
                isPrimaryToken(body.tokenIn),
              ),
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

const parseDhError = ({tag, error}: Left<Api.ResponseError>) =>
  freeze<Left<Api.ResponseError>>(
    {
      tag,
      error: {
        ...error,
        message: JSON.stringify(
          (error.responseData as any) ?? 'Dexhunter API error',
          null,
          2,
        )
          .replace(/^"/, '')
          .replace(/"$/, ''),
      },
    },
    true,
  )

const baseUrls = freeze({
  [Chain.Network.Mainnet]: 'https://api-us.dexhunterv3.app',
} as const)

const apiPaths = freeze(
  {
    tokens: '/swap/tokens',
    orders: ({address}: {address: string}) => `/swap/orders/${address}`,

    cancel: '/swap/cancel',
    estimate: '/swap/estimate',
    limitBuild: '/swap/limit/build',
    limitEstimate: '/swap/limit/estimate',
    reverseEstimate: '/swap/reverseEstimate',
    build: '/swap/build',
  } as const,
  true,
)
