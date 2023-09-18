import {PortfolioTokenInfo} from '../portfolio/token-info'
import {
  SwapCancelOrderData,
  SwapCompletedOrder,
  SwapCreateOrderData,
  SwapCreateOrderResponse,
  SwapOpenOrder,
} from './order'
import {SwapPool} from './pool'
import {PortfolioToken} from '../portfolio/token'

export interface SwapApi {
  createOrder(orderData: SwapCreateOrderData): Promise<SwapCreateOrderResponse>
  cancelOrder(orderData: SwapCancelOrderData): Promise<string>
  getOpenOrders(): Promise<SwapOpenOrder[]>
  getCompletedOrders(): Promise<SwapCompletedOrder[]>
  getPools(args: {
    tokenA: PortfolioTokenInfo['id']
    tokenB: PortfolioTokenInfo['id']
  }): Promise<SwapPool[]>
  getTokens(tokenIdBase: PortfolioTokenInfo['id']): Promise<PortfolioToken[]>
  stakingKey: string
  primaryTokenId: PortfolioTokenInfo['id']
}
