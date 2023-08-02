import {BalanceToken} from '../balance/token'
import {
  SwapCancelOrderData,
  SwapCreateOrderData,
  SwapCreateOrderResponse,
  SwapOpenOrder,
} from './order'
import {SwapPool} from './pool'

export interface SwapApi {
  createOrder(orderData: SwapCreateOrderData): Promise<SwapCreateOrderResponse>
  cancelOrder(orderData: SwapCancelOrderData): Promise<string>
  getOrders(): Promise<SwapOpenOrder[]>
  getPools(args: {
    tokenA: BalanceToken['info']['id']
    tokenB: BalanceToken['info']['id']
  }): Promise<SwapPool[]>
  getTokens(tokenBase: BalanceToken['info']['id']): Promise<BalanceToken[]>
}
