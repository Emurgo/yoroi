import {FetchData, fetchData, isRight} from '@yoroi/common'
import {Chain} from '@yoroi/types'
import {freeze} from 'immer'

import {DexHunterApi} from './types'
import {transformers} from './transformers'

export const dexhunterApiMaker = ({
  network,
  request = fetchData,
}: {
  network: Chain.SupportedNetworks
  request?: FetchData
}): Readonly<DexHunterApi.Interface> => {
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
    ) as DexHunterApi.Interface

  const baseUrl = baseUrls[network]

  return freeze(
    {
      async averagePrice(params: Readonly<DexHunterApi.AveragePriceArgs>) {
        const response = await request<DexHunterApi.AveragePriceResponse>({
          method: 'get',
          url: `${baseUrl}${apiPaths.averagePrice(
            transformers.averagePrice.request(params),
          )}`,
          headers,
        })

        if (isRight(response)) {
          try {
            const data = transformers.averagePrice.response(response.value.data)

            return freeze(
              {
                tag: 'right',
                value: {
                  status: response.value.status,
                  data,
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
                  message: 'Failed to transform average price',
                  responseData: response.value.data,
                },
              },
              true,
            )
          }
        }
        return freeze(
          {
            tag: 'left',
            error: {
              status: -3,
              message: 'Failed to fetch average price',
              responseData: response.error.responseData,
            },
          },
          true,
        )
      },

      async tokens() {
        const response = await request<DexHunterApi.TokensResponse>({
          method: 'get',
          url: `${baseUrl}${apiPaths.tokens}`,
          headers,
        })

        if (isRight(response)) {
          try {
            const data = transformers.tokens.response(response.value.data)

            return freeze(
              {
                tag: 'right',
                value: {
                  status: response.value.status,
                  data,
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
                  message: 'Failed to transform tokens',
                  responseData: response.value.data,
                },
              },
              true,
            )
          }
        }
        return freeze(
          {
            tag: 'left',
            error: {
              status: -3,
              message: 'Failed to fetch tokens',
              responseData: response.error.responseData,
            },
          },
          true,
        )
      },

      async orders(params: Readonly<DexHunterApi.OrdersArgs>) {
        const response = await request<DexHunterApi.OrdersResponse>({
          method: 'get',
          url: `${baseUrl}${apiPaths.orders(
            transformers.orders.request(params),
          )}`,
          headers,
        })

        if (isRight(response)) {
          try {
            const data = response.value.data

            return freeze(
              {
                tag: 'right',
                value: {
                  status: response.value.status,
                  data,
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
                  message: 'Failed to transform orders',
                  responseData: response.value.data,
                },
              },
              true,
            )
          }
        }
        return freeze(
          {
            tag: 'left',
            error: {
              status: -3,
              message: 'Failed to to fetch orders',
              responseData: response.error.responseData,
            },
          },
          true,
        )
      },

      async estimate(body: Readonly<DexHunterApi.EstimateArgs>) {
        const response = await request<DexHunterApi.EstimateResponse>({
          method: 'post',
          url: `${baseUrl}${apiPaths.estimate}`,
          headers,
          data: transformers.estimate.request(body),
        })

        if (isRight(response)) {
          try {
            const data = transformers.estimate.response(response.value.data)

            return freeze(
              {
                tag: 'right',
                value: {
                  status: response.value.status,
                  data,
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
                  message: 'Failed to transform estimate',
                  responseData: response.value.data,
                },
              },
              true,
            )
          }
        }
        return freeze(
          {
            tag: 'left',
            error: {
              status: -3,
              message: 'Failed to fetch estimate',
              responseData: response.error.responseData,
            },
          },
          true,
        )
      },

      async reverseEstimate(body: Readonly<DexHunterApi.ReverseEstimateArgs>) {
        const response = await request<DexHunterApi.ReverseEstimateResponse>({
          method: 'post',
          url: `${baseUrl}${apiPaths.estimate}`,
          headers,
          data: transformers.reverseEstimate.request(body),
        })

        if (isRight(response)) {
          try {
            const data = transformers.reverseEstimate.response(
              response.value.data,
            )

            return freeze(
              {
                tag: 'right',
                value: {
                  status: response.value.status,
                  data,
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
                  message: 'Failed to transform reverse estimate',
                  responseData: response.value.data,
                },
              },
              true,
            )
          }
        }
        return freeze(
          {
            tag: 'left',
            error: {
              status: -3,
              message: 'Failed to fetch reverse estimate',
              responseData: response.error.responseData,
            },
          },
          true,
        )
      },

      async swap(body: Readonly<DexHunterApi.SwapArgs>) {
        const response = await request<DexHunterApi.SwapResponse>({
          method: 'post',
          url: `${baseUrl}${apiPaths.swap}`,
          headers,
          data: transformers.swap.request(body),
        })

        if (isRight(response)) {
          try {
            const data = transformers.swap.response(response.value.data)

            return freeze(
              {
                tag: 'right',
                value: {
                  status: response.value.status,
                  data,
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
                  message: 'Failed to transform swap',
                  responseData: response.value.data,
                },
              },
              true,
            )
          }
        }
        return freeze(
          {
            tag: 'left',
            error: {
              status: -3,
              message: 'Failed to fetch swap',
              responseData: response.error.responseData,
            },
          },
          true,
        )
      },

      async sign(body: Readonly<DexHunterApi.SignArgs>) {
        const response = await request<DexHunterApi.SignResponse>({
          method: 'post',
          url: `${baseUrl}${apiPaths.sign}`,
          headers,
          data: transformers.sign.request(body),
        })

        if (isRight(response)) {
          try {
            const data = transformers.sign.response(response.value.data)

            return freeze(
              {
                tag: 'right',
                value: {
                  status: response.value.status,
                  data,
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
                  message: 'Failed to transform sign',
                  responseData: response.value.data,
                },
              },
              true,
            )
          }
        }
        return freeze(
          {
            tag: 'left',
            error: {
              status: -3,
              message: 'Failed to fetch sign',
              responseData: response.error.responseData,
            },
          },
          true,
        )
      },

      async cancel(body: Readonly<DexHunterApi.CancelArgs>) {
        const response = await request<DexHunterApi.CancelResponse>({
          method: 'post',
          url: `${baseUrl}${apiPaths.cancel}`,
          headers,
          data: transformers.cancel.request(body),
        })

        if (isRight(response)) {
          try {
            const data = transformers.cancel.response(response.value.data)

            return freeze(
              {
                tag: 'right',
                value: {
                  status: response.value.status,
                  data,
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
                  message: 'Failed to transform cancel',
                  responseData: response.value.data,
                },
              },
              true,
            )
          }
        }
        return freeze(
          {
            tag: 'left',
            error: {
              status: -3,
              message: 'Failed to fetch cancel',
              responseData: response.error.responseData,
            },
          },
          true,
        )
      },

      async limit(body: Readonly<DexHunterApi.LimitOrderArgs>) {
        const response = await request<DexHunterApi.LimitOrderResponse>({
          method: 'post',
          url: `${baseUrl}${apiPaths.limit}`,
          headers,
          data: transformers.limit.request(body),
        })

        if (isRight(response)) {
          try {
            const data = transformers.limit.response(response.value.data)

            return freeze(
              {
                tag: 'right',
                value: {
                  status: response.value.status,
                  data,
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
                  message: 'Failed to transform limit',
                  responseData: response.value.data,
                },
              },
              true,
            )
          }
        }
        return freeze(
          {
            tag: 'left',
            error: {
              status: -3,
              message: 'Failed to fetch limit',
              responseData: response.error.responseData,
            },
          },
          true,
        )
      },

      async limitEstimate(body: Readonly<DexHunterApi.LimitOrderArgs>) {
        const response = await request<DexHunterApi.LimitOrderEstimate>({
          method: 'post',
          url: `${baseUrl}${apiPaths.limitEstimate}`,
          headers,
          data: transformers.limitEstimate.request(body),
        })

        if (isRight(response)) {
          try {
            const data = transformers.limitEstimate.response(
              response.value.data,
            )

            return freeze(
              {
                tag: 'right',
                value: {
                  status: response.value.status,
                  data,
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
                  message: 'Failed to transform limit estimate',
                  responseData: response.value.data,
                },
              },
              true,
            )
          }
        }
        return freeze(
          {
            tag: 'left',
            error: {
              status: -3,
              message: 'Failed to fetch limit estimate',
              responseData: response.error.responseData,
            },
          },
          true,
        )
      },
    },
    true,
  )
}

const baseUrls = freeze({
  [Chain.Network.Mainnet]: 'https://api-us.dexhunterv3.app',
} as const)

const apiPaths = freeze({
  charts: '/charts', // POST
  dcaCancel: '/dca/cancel', // POST
  dcaCreate: '/dca/create', // POST
  dcaEstimate: '/dca/estimate', // POST
  dcaByAdress: ({address}: {address: string}) => `/dca/${address}`, // GET
  markingSubmit: '/marking/submit', // POST
  tokens: '/swap/tokens', // GET
  averagePrice: ({
    tokenInId,
    tokenOutId,
  }: {
    tokenInId: string
    tokenOutId: string
  }) => `/swap/averagePrice/${tokenInId}/${tokenOutId}`, // GET
  cancel: '/swap/cancel', // POST
  estimate: '/swap/estimate', // POST
  limit: '/swap/limit', // POST
  limitEstimate: '/swap/limitEstimate', // POST
  orders: ({userAddress}: {userAddress: string}) =>
    `/swap/orders/${userAddress}`, // GET
  reverseEstimate: '/swap/reverseEstimate', // POST
  sign: '/swap/sign', // POST
  swap: '/swap/swap', // POST
  wallet: '/swap/wallet', // POST
} as const)

const headers = freeze({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const)
