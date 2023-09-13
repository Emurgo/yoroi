import {Swap} from '@yoroi/types'
import {OpenSwap, OpenSwapApi} from '@yoroi/openswap'

import {
  asOpenswapAmount,
  asOpenswapTokenId,
  asYoroiBalanceTokens,
  asYoroiCompletedOrder,
  asYoroiOpenOrder,
  asYoroiPools,
} from '../../helpers/transformers'
import {apiMocks} from './api.mocks'

export const swapApiMaker = (
  {
    isMainnet,
    stakingKey,
    primaryTokenId,
  }: {isMainnet?: boolean; stakingKey: string; primaryTokenId: string},
  deps?: {openswap?: OpenSwapApi},
): Readonly<Swap.Api> => {
  const api =
    deps?.openswap ?? new OpenSwapApi(isMainnet ? 'mainnet' : 'preprod')

  const getOpenOrders: Swap.Api['getOpenOrders'] = () =>
    api
      .getOrders(stakingKey)
      .then((orders) =>
        orders.map((order) => asYoroiOpenOrder(order, primaryTokenId)),
      )

  const getCompletedOrders: Swap.Api['getCompletedOrders'] = () =>
    api
      .getCompletedOrders(stakingKey)
      .then((orders) => orders.map((order) => asYoroiCompletedOrder(order)))

  const createOrder: Swap.Api['createOrder'] = async (orderData) => {
    const {amounts, address, selectedPool} = orderData

    const orderRequest: OpenSwap.CreateOrderRequest = {
      walletAddress: address,
      // TODO: check this mistmach of protocol x provider on our end
      protocol:
        selectedPool.provider as OpenSwap.CreateOrderRequest['protocol'],
      poolId: selectedPool.poolId,
      sell: asOpenswapAmount(amounts.sell),
      buy: asOpenswapAmount(amounts.buy),
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

  const getTokens: Swap.Api['getTokens'] = async (token) =>
    !isMainnet
      ? apiMocks.getTokens // preprod doesn't return any tokens
      : api.getTokens(asOpenswapTokenId(token)).then(asYoroiBalanceTokens)

  const getPools: Swap.Api['getPools'] = async ({tokenA, tokenB}) => {
    if (!isMainnet) return apiMocks.getPools // preprod doesn't return any pools

    const tokenIdA = asOpenswapTokenId(tokenA)
    const tokenIdB = asOpenswapTokenId(tokenB)

    return api
      .getPools({
        tokenA: {
          policyId: tokenIdA.policyId,
          assetNameHex: tokenIdA.assetName,
        },
        tokenB: {
          policyId: tokenIdB.policyId,
          assetNameHex: tokenIdB.assetName,
        },
      })
      .then(asYoroiPools)
  }

  return {
    getOpenOrders,
    cancelOrder,
    createOrder,
    getTokens,
    getPools,
    getCompletedOrders,
  } as const
}
