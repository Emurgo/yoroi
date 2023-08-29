import {Swap, Balance} from '@yoroi/types'
import {OpenSwapApi, CreateOrderRequest} from '@yoroi/openswap'
import {
  asOpenswapAmount,
  asOpenswapTokenId,
  asOpenswapTokenIdHex,
  asYoroiBalanceTokens,
  asYoroiOrders,
  asYoroiPools,
} from './transformers'
import {getTokensMock} from '../helpers/tokens.mocks'
import {getPoolsMock} from '../helpers/pools.mocks'

export const makeSwapApi = (
  // FIX: network Yoroi type need to bring from the wallet // chain Id
  {network, stakingKey}: {network: 1 | 0 | 300; stakingKey: string},
  deps?: {openswap?: OpenSwapApi},
): Readonly<Swap.Api> => {
  const api =
    deps?.openswap ?? new OpenSwapApi(network === 0 ? 'mainnet' : 'preprod')

  const getOrders: Swap.Api['getOrders'] = async (): Promise<
    Swap.OpenOrder[]
  > => api.getOrders(stakingKey).then(asYoroiOrders)

  const createOrder: Swap.Api['createOrder'] = async (
    orderData,
  ): Promise<Swap.CreateOrderResponse> => {
    const orderRequest: CreateOrderRequest = {
      walletAddress: orderData.address,
      protocol: orderData.selectedPool
        .provider as CreateOrderRequest['protocol'],
      poolId: orderData.selectedPool.poolId,
      sell: asOpenswapAmount(orderData.amounts.sell),
      buy: asOpenswapAmount(orderData.amounts.buy),
    }
    return api.createOrder(orderRequest).then((response) => {
      if (response.status === 'failed')
        return Promise.reject(response.reason ?? 'Unknown error')
      return Promise.resolve({
        datum: response.datum,
        datumHash: response.hash,
        contractAddress: response.address,
      })
    })
  }

  const cancelOrder: Swap.Api['cancelOrder'] = async (
    orderData,
  ): Promise<string> => {
    const {address, utxos} = orderData
    return api
      .cancelOrder({
        orderUTxO: utxos.order,
        collateralUTxO: utxos.collateral,
        walletAddress: address,
      })
      .then((response) => response)
  }

  // TODO: it should be abstracted by our own backend after our native assets have all data
  const getTokens: Swap.Api['getTokens'] = async (
    token,
  ): Promise<Balance.Token[]> => {
    if (network === 1) {
      return getTokensMock as Balance.Token[]
    } else {
    }
    return api.getTokens(asOpenswapTokenId(token)).then(asYoroiBalanceTokens)
  }

  const getPoolPairs: Swap.Api['getPoolPairs'] = async ({
    tokenA,
    tokenB,
  }): Promise<Swap.PoolPair[]> => {
    if (network === 1) {
      return getPoolsMock as Swap.PoolPair[]
    } else {
      return api
        .getPools({
          tokenA: asOpenswapTokenIdHex(tokenA),
          tokenB: asOpenswapTokenIdHex(tokenB),
        })
        .then(asYoroiPools)
    }
  }

  return {
    getOrders,
    cancelOrder,
    createOrder,
    getTokens,
    getPoolPairs,
  } as const
}
