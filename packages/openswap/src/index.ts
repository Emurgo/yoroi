export * from './api'
import * as Types from './types'

export namespace OpenSwap {
  export type Provider = Types.Provider
  export type Network = Types.Network

  // Orders
  export type CreateOrderRequest = Types.CreateOrderRequest
  export type CreateOrderResponse = Types.CreateOrderResponse
  export type CancelOrderRequest = Types.CancelOrderRequest
  export type OpenOrder = Types.OpenOrder
  export type OpenOrderResponse = Types.OpenOrderResponse
  export type CompletedOrder = Types.CompletedOrder
  export type CompletedOrderResponse = Types.CompletedOrderResponse

  // Pools
  export type PoolPair = Types.PoolPair
  export type PoolPairResponse = Types.PoolPairResponse
  export type LiquidityPool = Types.LiquidityPool
  export type LiquidityPoolResponse = Types.LiquidityPoolResponse

  // Tokens
  export type Token = Types.Token
  export type TokenResponse = Types.TokenResponse
  export type TokenAddress = Types.TokenAddress
}
