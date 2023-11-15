import {App, Balance, Swap} from '@yoroi/types'

export const swapManagerMaker = ({
  swapStorage,
  swapApi,
  frontendFeeTiers,
  aggregatorTokenId,
  aggregator,
}: {
  swapStorage: Swap.Storage
  swapApi: Swap.Api
  frontendFeeTiers: ReadonlyArray<App.FrontendFeeTier>
  aggregatorTokenId?: Balance.TokenInfo['id']
  aggregator: Swap.Aggregator
}): Readonly<Swap.Manager> => {
  const {clear: clearStorage, slippage} = swapStorage
  const {
    getPrice,
    getPools,
    getOpenOrders,
    getCompletedOrders,
    getTokenPairs,
    getTokens,
    cancelOrder,
    createOrder,
    primaryTokenId,
    stakingKey,
    supportedProviders,
  } = swapApi

  const order = {
    cancel: cancelOrder,
    create: createOrder,
    list: {
      byStatusOpen: getOpenOrders,
      byStatusCompleted: getCompletedOrders,
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

  const tokens = {
    list: {
      byPair: getTokenPairs,
      onlyVerified: getTokens,
    } as const,
  }

  return {
    price,
    clearStorage,
    slippage,
    order,
    tokens,
    pools,
    primaryTokenId,
    stakingKey,
    supportedProviders,
    frontendFeeTiers,
    aggregator,
    aggregatorTokenId,
  } as const
}
