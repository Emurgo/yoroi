import {BalanceToken} from '../balance/token'
import {
  SwapCancelOrderData,
  SwapCompletedOrder,
  SwapCreateOrderData,
  SwapCreateOrderResponse,
  SwapOpenOrder,
} from './order'
import {SwapPool, SwapPoolProvider} from './pool'

export interface SwapApi {
  createOrder(orderData: SwapCreateOrderData): Promise<SwapCreateOrderResponse>
  cancelOrder(orderData: SwapCancelOrderData): Promise<string>
  getOpenOrders(): Promise<SwapOpenOrder[]>
  getCompletedOrders(): Promise<SwapCompletedOrder[]>
  getPools(args: {
    tokenA: BalanceToken['info']['id']
    tokenB: BalanceToken['info']['id']
    providers?: ReadonlyArray<SwapPoolProvider>
  }): Promise<SwapPool[]>
  getTokenPairs(
    tokenIdBase: BalanceToken['info']['id'],
  ): Promise<BalanceToken[]>
  getTokens(): Promise<BalanceToken['info'][]>
  getPrice(args: {
    baseToken: BalanceToken['info']['id']
    quoteToken: BalanceToken['info']['id']
  }): Promise<number>
  stakingKey: string
  primaryTokenId: BalanceToken['info']['id']
  supportedProviders: ReadonlyArray<SwapPoolProvider>
}
