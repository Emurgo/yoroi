import {Swap} from '@yoroi/types'

export const swapManagerMaker = (
  swapStorage: Swap.Storage,
  swapApi: Swap.Api,
): Readonly<Swap.Manager> => {
  const {clear: clearStorage, slippage} = swapStorage
  const {
    getPools,
    getOpenOrders,
    getCompletedOrders,
    getTokens,
    cancelOrder,
    createOrder,
    primaryTokenId,
    stakingKey,
  } = swapApi

  const order = {
    cancel: cancelOrder,
    create: createOrder,
    list: {
      byStatusOpen: getOpenOrders,
      byStatusCompleted: getCompletedOrders,
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
    primaryTokenId,
    stakingKey,
  } as const
}
