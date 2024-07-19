import {PortfolioTokenInfo} from '../portfolio/info'
import {PortfolioTokenId} from '../portfolio/token'
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
    tokenA: PortfolioTokenId
    tokenB: PortfolioTokenId
    providers?: ReadonlyArray<SwapPoolProvider>
  }): Promise<SwapPool[]>
  getTokenPairs(
    tokenIdBase: PortfolioTokenId,
  ): Promise<Array<PortfolioTokenInfo>>
  getTokens(): Promise<Array<PortfolioTokenInfo>>
  getPrice(args: {
    baseToken: PortfolioTokenId
    quoteToken: PortfolioTokenId
  }): Promise<number>
  stakingKey: string
  primaryTokenInfo: Readonly<PortfolioTokenInfo>
  supportedProviders: ReadonlyArray<SwapPoolProvider>
}
