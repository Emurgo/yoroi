export * from './api'
import * as Types from './types'

export namespace OpenSwap {
  export type Protocol = Types.Protocol
  export type Network = Types.Network

  // Order
  export type CreateOrderRequest = Types.CreateOrderRequest
  export type CreateOrderResponse = Types.CreateOrderResponse
  export type CancelOrderRequest = Types.CancelOrderRequest
  export type OpenOrder = Types.OpenOrder
  export type OpenOrderResponse = Types.OpenOrderResponse
  export type CompletedOrder = Types.CompletedOrder
  export type CompletedOrderResponse = Types.CompletedOrderResponse

  // Pool
  export type Pool = Types.Pool
  export type PoolResponse = Types.PoolResponse

  // Token
  export type Token = Types.Token
  export type TokenResponse = Types.TokenResponse
  export type TokenAddress = Types.TokenAddress

  export type PriceAddress = Types.PriceAddress
  export type PriceResponse = Types.PriceResponse
}
