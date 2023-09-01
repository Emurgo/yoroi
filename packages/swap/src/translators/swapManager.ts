import {Swap} from '@yoroi/types'

export const makeSwapManager = (
  swapStorage: Swap.Storage,
  swapApi: Swap.Api,
): Readonly<Swap.Manager> => {
  const {clear: clearStorage, slippage} = swapStorage
  const {getPools, getOrders, getTokens, cancelOrder, createOrder} = swapApi

  const order = {
    cancel: cancelOrder,
    create: createOrder,
    list: {
      byStatusOpen: getOrders,
    } as const,
  }

  const pairs = {
    list: {
      byToken: getTokens,
    } as const,
  }

  const pools = {
    list: {
      byPair: getPools,
    } as const,
  }

  return {
    clearStorage,
    slippage,
    order,
    pairs,
    pools,
  } as const
}
