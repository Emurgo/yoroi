import {Swap} from '@yoroi/types'

import {transformersMaker} from '../helpers/transformers'
import {OpenSwapApi} from './openswap-api/api'
import {apiMocks} from './openswap-api/api.mocks'
import {CreateOrderRequest} from './openswap-api/types'

export const swapApiMaker = (
  {
    isMainnet,
    stakingKey,
    primaryTokenId,
    supportedProviders,
  }: {
    isMainnet?: boolean
    stakingKey: string
    primaryTokenId: string
    supportedProviders: ReadonlyArray<Swap.SupportedProvider>
  },
  deps?: {openswap?: OpenSwapApi},
): Readonly<Swap.Api> => {
  const api =
    deps?.openswap ?? new OpenSwapApi(isMainnet ? 'mainnet' : 'preprod')
  const transformers = transformersMaker(primaryTokenId)

  const getOpenOrders: Swap.Api['getOpenOrders'] = () =>
    api
      .getOrders(stakingKey)
      .then((orders) =>
        orders.map((order) => transformers.asYoroiOpenOrder(order)),
      )

  const getCompletedOrders: Swap.Api['getCompletedOrders'] = () =>
    api
      .getCompletedOrders(stakingKey)
      .then((orders) =>
        orders.map((order) => transformers.asYoroiCompletedOrder(order)),
      )

  const createOrder: Swap.Api['createOrder'] = async (orderData) => {
    const {amounts, address, selectedPool} = orderData

    const orderRequest: CreateOrderRequest = {
      walletAddress: address,
      protocol: selectedPool.provider as CreateOrderRequest['protocol'],
      poolId: selectedPool.poolId,
      sell: transformers.asOpenswapAmount(amounts.sell),
      buy: transformers.asOpenswapAmount(amounts.buy),
    }

    return api.createOrder(orderRequest).then((response) => {
      if (response.status === 'failed')
        return Promise.reject(response.reason ?? 'Unknown error')

      return {
        datum: response.datum,
        datumHash: response.hash,
        contractAddress: response.address,
      }
    })
  }

  const cancelOrder: Swap.Api['cancelOrder'] = (orderData) =>
    api
      .cancelOrder({
        orderUTxO: orderData.utxos.order,
        collateralUTxO: orderData.utxos.collateral,
        walletAddress: orderData.address,
      })
      .then((response) => response)

  const getTokenPairs: Swap.Api['getTokenPairs'] = async (token) =>
    !isMainnet
      ? apiMocks.getTokenPairs // preprod doesn't return any tokens
      : api
          .getTokenPairs(transformers.asOpenswapTokenId(token))
          .then(transformers.asYoroiBalanceTokens)

  const getTokens: Swap.Api['getTokens'] = async () => {
    return api.getTokens().then(transformers.asYoroiBalanceTokenInfos)
  }

  const getPools: Swap.Api['getPools'] = async ({
    tokenA,
    tokenB,
    providers = supportedProviders,
  }) => {
    if (!isMainnet) return apiMocks.getPools // preprod doesn't return any pools

    return api
      .getLiquidityPools({
        tokenA,
        tokenB,
        providers,
      })
      .then(transformers.asYoroiPools)
  }

  const getPrice: Swap.Api['getPrice'] = async ({baseToken, quoteToken}) => {
    const opBaseToken = transformers.asOpenswapPriceTokenAddress(baseToken)
    const opQuoteToken = transformers.asOpenswapPriceTokenAddress(quoteToken)

    return api
      .getPrice({
        baseToken: {
          ...opBaseToken,
        },
        quoteToken: {
          ...opQuoteToken,
        },
      })
      .then((response) => response.price)
  }

  return {
    getPrice,
    getOpenOrders,
    cancelOrder,
    createOrder,
    getTokens,
    getTokenPairs,
    getPools,
    getCompletedOrders,
    stakingKey,
    primaryTokenId,
    supportedProviders,
  } as const
}
