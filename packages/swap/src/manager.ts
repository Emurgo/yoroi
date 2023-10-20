import {App, Balance, Swap} from '@yoroi/types'

export const swapManagerMaker = ({
  swapStorage,
  swapApi,
  frontendFee,
  aggregatorToken,
  aggregator,
}: {
  swapStorage: Swap.Storage
  swapApi: Swap.Api
  frontendFee: ReadonlyArray<App.FrontendFeeTier>
  aggregatorToken?: Balance.TokenInfo['id']
  aggregator: Swap.Aggregator
}): Readonly<Swap.Manager> => {
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
    frontendFee,
    aggregator,
    aggregatorToken,
  } as const
}
