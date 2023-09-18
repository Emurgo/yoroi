import {PortfolioTokenInfo} from '../portfolio/token-info'
import {SwapApi} from './api'
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
  pools: {
    list: {
      byPair: SwapApi['getPools']
    }
  }
  stakingKey: string
  primaryTokenId: PortfolioTokenInfo['id']
}>
