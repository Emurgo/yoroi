// mocks
export {
  mockSwapManager,
  mockSwapManagerDefault,
  swapManagerMocks,
} from './manager.mocks'
export {mockSwapStateDefault} from './translators/reactjs/state/state.mocks'
export {apiMocks} from './adapters/openswap-api/api.mocks'
export {mocks as orderMocks} from './helpers/mocks'

// orders amounts
export {getBuyAmount} from './helpers/orders/amounts/getBuyAmount'
export {getSellAmount} from './helpers/orders/amounts/getSellAmount'
export {getQuantityWithSlippage} from './helpers/orders/amounts/getQuantityWithSlippage'
// orders factories
export {makePossibleMarketOrder} from './helpers/orders/factories/makePossibleMarketOrder'
export {makeLimitOrder} from './helpers/orders/factories/makeLimitOrder'
export {makeOrderCalculations} from './helpers/orders/factories/makeOrderCalculations'
// orders costs
export {getLiquidityProviderFee} from './helpers/orders/costs/getLiquidityProviderFee'
export {getFrontendFee} from './helpers/orders/costs/getFrontendFee'

// prices
export {getMarketPrice} from './helpers/prices/getMarketPrice'
export {getPriceAfterFee} from './helpers/prices/getPriceAfterFee'
export {getPairPriceInPtTerms} from './helpers/prices/getPairPriceInPtTerms'

// pools
export {getPoolUrlByProvider} from './helpers/pools/getPoolUrlByProvider'
export {getBestBuyPool} from './helpers/pools/getBestBuyPool'
export {getBestSellPool} from './helpers/pools/getBestSellPool'
export {getBestPoolCalculation} from './helpers/pools/getBestPoolCalculation'

// translators
export {SwapProvider} from './translators/reactjs/provider/SwapProvider'
export {SwapState} from './translators/reactjs/state/state'
export {useSwapCreateOrder} from './translators/reactjs/hooks/useSwapCreateOrder'
export {useSwapOrdersByStatusCompleted} from './translators/reactjs/hooks/useSwapOrdersByStatusCompleted'
export {useSwapOrdersByStatusOpen} from './translators/reactjs/hooks/useSwapOrdersByStatusOpen'
export {useSwapPoolsByPair} from './translators/reactjs/hooks/useSwapPoolsByPair'
export {useSwapSetSlippage} from './translators/reactjs/hooks/useSwapSetSlippage'
export {useSwapSlippage} from './translators/reactjs/hooks/useSwapSlippage'
export {useSwapTokensByPair} from './translators/reactjs/hooks/useSwapTokensByPair'
export {useSwapTokensOnlyVerified} from './translators/reactjs/hooks/useSwapTokensOnlyVerified'
export {useSwap} from './translators/reactjs/hooks/useSwap'
export {supportedProviders, milkTokenId} from './translators/constants'

// types
export {type SwapOrderCalculation} from './translators/reactjs/state/state'

// factories
export {swapApiMaker} from './adapters/openswap-api/api-maker'
export {swapManagerMaker} from './manager'
export {
  swapStorageMaker,
  swapStorageSlippageKey,
} from './adapters/async-storage/storage'
export {
  makeStorageMaker,
  makeStorageMakerDefault,
} from './adapters/async-storage/storage.mocks'
