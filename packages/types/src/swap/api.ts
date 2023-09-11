import {BalanceToken} from '../balance/token'
import {
  SwapCancelOrderData,
  SwapCompletedOrder,
  SwapCreateOrderData,
  SwapCreateOrderResponse,
  SwapOpenOrder,
} from './order'
import {SwapPoolPair} from './pool'

export interface SwapApi {
  createOrder(orderData: SwapCreateOrderData): Promise<SwapCreateOrderResponse>
  cancelOrder(orderData: SwapCancelOrderData): Promise<string>
  getOrders(): Promise<SwapOpenOrder[]>
  getCompletedOrders(): Promise<SwapCompletedOrder[]>
  getPoolPairs(args: {
    tokenA: BalanceToken['info']['id']
    tokenB: BalanceToken['info']['id']
  }): Promise<SwapPoolPair[]>
  getTokens(tokenIdBase: BalanceToken['info']['id']): Promise<BalanceToken[]>
}
