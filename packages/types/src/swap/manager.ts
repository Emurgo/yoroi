import {AppFrontendFeeTier} from '../api/app'
import {BalanceToken} from '../balance/token'
import {SwapAggregator} from './aggregator'
import {SwapApi} from './api'
import {SwapPoolProvider} from './pool'
import {SwapStorage} from './storage'

export type SwapManager = Readonly<{
  clearStorage: SwapStorage['clear']
  slippage: SwapStorage['slippage']
  order: {
    cancel: SwapApi['cancelOrder']
    create: SwapApi['createOrder']
    list: {
      byStatusOpen: SwapApi['getOpenOrders']
      byStatusCompleted: SwapApi['getCompletedOrders']
    }
  }
  tokens: {
    list: {
      onlyVerified: SwapApi['getTokens']
      byPair: SwapApi['getTokenPairs']
    }
  }
  price: {
    byPair: SwapApi['getPrice']
  }
  pools: {
    list: {
      byPair: SwapApi['getPools']
    }
  }
  stakingKey: string
  primaryTokenId: BalanceToken['info']['id']
  supportedProviders: ReadonlyArray<SwapPoolProvider>
  aggregator: SwapAggregator
  aggregatorTokenId?: BalanceToken['info']['id']
  frontendFeeTiers: ReadonlyArray<AppFrontendFeeTier>
}>
