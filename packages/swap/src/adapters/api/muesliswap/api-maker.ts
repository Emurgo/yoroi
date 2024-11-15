import {FetchData, fetchData, isLeft} from '@yoroi/common'
import {Api, App, Chain, Portfolio, Swap} from '@yoroi/types'
import {freeze} from 'immer'
import {memoize} from 'lodash-es'
import {
  CancelRequest,
  CancelResponse,
  ConstructSwapDatumResponse,
  LiquidityPoolResponse,
  OrdersAggregatorResponse,
  OrdersHistoryResponse,
  TokensResponse,
} from './types'
import {transformersMaker} from './transformers'
import {estimateCalculation} from './calculations'

export type MuesliswapApiConfig = {
  frontendFeeTiers: ReadonlyArray<App.FrontendFeeTier>
  lpTokenHeld?: number
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
  const {
    frontendFeeTiers,
    lpTokenHeld,
    stakingKey,
    addressHex,
    primaryTokenInfo,
    network,
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

  // Asking for pools on every amount change would be bad UI and third party API spam
  const getLiquidityPools = memoize(
    async (body: Swap.EstimateRequest) => {
      const params = transformers.liquidityPools.request(body)

      const response = await request<LiquidityPoolResponse>(
        {
          method: 'get',
          url: apiUrls.liquidityPools,
          headers,
        },
        {
          params,
        },
      )

      if (isLeft(response)) return response

      return freeze(
        {
          tag: 'right' as const,
          value: {
            status: response.value.status,
            data: transformers.liquidityPools.response(
              response.value.data,
              body,
            ),
          },
        },
        true,
      )
    },
    ({tokenIn, tokenOut, dex, blacklistedDexes}) =>
      [
        new Date().getMinutes(), // cache every minute
        tokenIn,
        tokenOut,
        dex,
        blacklistedDexes?.join(),
      ].join('_'),
  )

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
        const [historyResponse, aggregatorResponse] = await Promise.all([
          request<OrdersHistoryResponse>(
            {
              method: 'get',
              url: apiUrls.ordersHistory,
              headers,
            },
            {
              params: {
                'stake-key-hash': stakingKey,
              },
            },
          ),
          request<OrdersAggregatorResponse>(
            {
              method: 'get',
              url: apiUrls.ordersAggregator,
              headers,
            },
            {
              params: {
                wallet: addressHex,
              },
            },
          ),
        ])

        if (isLeft(historyResponse)) return historyResponse
        if (isLeft(aggregatorResponse)) return aggregatorResponse

        return freeze(
          {
            tag: 'right',
            value: {
              status: 200,
              data: [
                ...transformers.ordersHistory.response(
                  historyResponse.value.data,
                ),
                ...transformers.ordersAggregator.response(
                  aggregatorResponse.value.data,
                ),
              ],
            },
          },
          true,
        )
      },

      async estimate(body: Swap.EstimateRequest) {
        // This cache is very dumb, clear on ocasion so it doesn't accumulate too many entries
        if (body.amountIn === 0) getLiquidityPools.cache.clear?.()

        const response = await getLiquidityPools(body)

        if (isLeft(response)) return response

        try {
          return freeze(
            {
              tag: 'right',
              value: {
                status: response.value.status,
                data: estimateCalculation(
                  response.value.data,
                  body,
                  primaryTokenInfo,
                  frontendFeeTiers,
                  lpTokenHeld,
                ),
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
        const estimateResponse: Api.Response<Swap.EstimateResponse> =
          await this.estimate({...body, slippage: body.slippage ?? 0})

        if (isLeft(estimateResponse)) return estimateResponse

        const lastEstimate = estimateResponse.value.data

        const params = transformers.constructSwapDatum.request(
          body,
          lastEstimate.splits[0]!,
        )

        const response = await request<ConstructSwapDatumResponse>(
          {
            method: 'get',
            url: apiUrls.constructSwapDatum,
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
              data: transformers.constructSwapDatum.response(
                response.value.data,
                lastEstimate,
              ),
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
  ordersHistory: 'https://api.muesliswap.com/orders/v3/history',
  ordersAggregator: 'https://api.muesliswap.com/orders/aggregator',
  liquidityPools: 'https://api.muesliswap.com/liquidity/pools',
  constructSwapDatum: 'https://aggregator.muesliswap.com/constructSwapDatum',
  cancel: 'https://aggregator.muesliswap.com/cancelSwapTransaction',
} as const

export const milkTokenId =
  'afbe91c0b44b3040e360057bf8354ead8c49c4979ae6ab7c4fbdc9eb.4d494c4b7632'
export const oldMilkTokenId =
  '8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa.4d494c4b'
