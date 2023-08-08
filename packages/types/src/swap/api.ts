import {BalanceToken} from '../balance/token'
import {
  SwapCancelOrderData,
  SwapCreateOrderData,
  SwapCreateOrderResponse,
  SwapOpenOrder,
} from './order'
import {SwapPoolPair} from './pool'

export interface SwapApi {
  createOrder(orderData: SwapCreateOrderData): Promise<SwapCreateOrderResponse>
  cancelOrder(orderData: SwapCancelOrderData): Promise<string>
  getOrders(): Promise<SwapOpenOrder[]>
  getPoolPairs(args: {
    tokenA: BalanceToken['info']['id']
    tokenB: BalanceToken['info']['id']
  }): Promise<SwapPoolPair[]>
  getTokens(tokenBase: BalanceToken['info']['id']): Promise<BalanceToken[]>
}
