import {BalanceToken} from '../balance/token'
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
  pairs: {
    list: {
      byToken: SwapApi['getTokens']
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
  frontendFees: {
    get: SwapApi['getFrontendFees']
  }
  stakingKey: string
  primaryTokenId: BalanceToken['info']['id']
  supportedProviders: ReadonlyArray<SwapPoolProvider>
}>
