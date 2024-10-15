import {App, Portfolio, Swap} from '@yoroi/types'
import {makeOrderCalculations} from './helpers/orders/factories/makeOrderCalculations'
import {getBestPoolCalculation} from './helpers/pools/getBestPoolCalculation'
import {selectedPoolCalculationSelector} from './translators/reactjs/state/selectors/selectedPoolCalculationSelector'

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
  aggregatorTokenId?: Portfolio.Token.Id
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
    primaryTokenInfo,
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
    primaryTokenInfo,
    stakingKey,
    supportedProviders,
    frontendFeeTiers,
    aggregator,
    aggregatorTokenId,
    makeOrderCalculations,
    getBestPoolCalculation,
    selectedPoolCalculationSelector,
  } as const
}
