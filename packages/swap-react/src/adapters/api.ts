import {Swap, Balance} from '@yoroi/types'
import {OpenSwapApi, CreateOrderRequest} from '@yoroi/swap'
import {
  asOpenswapAmount,
  asOpenswapTokenId,
  asYoroiBalanceTokens,
  asYoroiOrders,
} from './transformers'

export const makeSwapApi = (
  // FIX: network Yoroi type need to bring from the wallet // chain Id
  {network, stakingKey}: {network: 1 | 0 | 300; stakingKey: string},
  deps?: {openswap?: OpenSwapApi},
): Swap.Api => {
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
      protocol: orderData.protocol as CreateOrderRequest['protocol'],
      poolId: orderData.poolId,
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
  ): Promise<Balance.Token[]> =>
    api.getTokens(asOpenswapTokenId(token)).then(asYoroiBalanceTokens)

  const getPools: Swap.Api['getPools'] = async ({
    tokenA,
    tokenB,
  }): Promise<Swap.Pool[]> =>
    api
      .getPools({
        tokenA: asOpenswapTokenId(tokenA),
        tokenB: asOpenswapTokenId(tokenB),
      })
      .then((pools) => pools)

  return {getOrders, cancelOrder, createOrder, getTokens, getPools} as Swap.Api
}
