import {Swap} from '@yoroi/types'

export const swapManagerMaker = (
  swapStorage: Swap.Storage,
  swapApi: Swap.Api,
): Readonly<Swap.Manager> => {
  const {clear: clearStorage, slippage} = swapStorage
  const {
    getPrice,
    getPools,
    getOpenOrders,
    getCompletedOrders,
    getTokens,
    cancelOrder,
    createOrder,
    primaryTokenId,
    stakingKey,
    supportedProviders,
    getFrontendFees,
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

  const price = {
    byPair: getPrice,
  } as const

  const pools = {
    list: {
      byPair: getPools,
    } as const,
  }

  const frontendFees = {
    get: getFrontendFees,
  }

  return {
    price,
    clearStorage,
    slippage,
    order,
    pairs,
    pools,
    primaryTokenId,
    stakingKey,
    supportedProviders,
    frontendFees,
  } as const
}
