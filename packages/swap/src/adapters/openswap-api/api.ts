import {Swap} from '@yoroi/types'
import {OpenSwap, OpenSwapApi} from '@yoroi/openswap'

import {transformersMaker} from '../../helpers/transformers'
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

    const orderRequest: OpenSwap.CreateOrderRequest = {
      walletAddress: address,
      // TODO: check this mistmach of protocol x provider on our end
      protocol:
        selectedPool.provider as OpenSwap.CreateOrderRequest['protocol'],
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

  const getTokens: Swap.Api['getTokens'] = async (token) =>
    !isMainnet
      ? apiMocks.getTokens // preprod doesn't return any tokens
      : api
          .getTokens(transformers.asOpenswapTokenId(token))
          .then(transformers.asYoroiBalanceTokens)

  const getPools: Swap.Api['getPools'] = async ({tokenA, tokenB}) => {
    if (!isMainnet) return apiMocks.getPools // preprod doesn't return any pools

    const tokenIdA = transformers.asOpenswapTokenId(tokenA)
    const tokenIdB = transformers.asOpenswapTokenId(tokenB)

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
      .then(transformers.asYoroiPools)
  }

  return {
    getOpenOrders,
    cancelOrder,
    createOrder,
    getTokens,
    getPools,
    getCompletedOrders,
    stakingKey,
    primaryTokenId,
  } as const
}
