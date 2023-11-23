import {
  BalanceAmount,
  BalanceAmounts,
  BalanceCardanoMetadatas,
  BalanceQuantity,
  BalanceToken,
} from './balance/token'
import {SwapApi} from './swap/api'
import {SwapProtocol} from './swap/protocol'
import {
  SwapCancelOrderData,
  SwapCompletedOrder,
  SwapCreateOrderData,
  SwapCreateOrderResponse,
  SwapOpenOrder,
  SwapOrderType,
} from './swap/order'
import {SwapPool, SwapPoolProvider, SwapSupportedProvider} from './swap/pool'
import {SwapStorage} from './swap/storage'
import {SwapManager} from './swap/manager'
import {AppStorage, AppStorageFolderName} from './app/storage'
import {AppMultiStorage, AppMultiStorageOptions} from './app/multi-storage'
import {NumberLocale} from './intl/numbers'
import {SwapAggregator} from './swap/aggregator'
import {AppApi} from './app/api'
import {AppFrontendFeesResponse, AppFrontendFeeTier} from './app/frontend-fees'
import {AppProtocolParamsResponse} from './app/protocol-params'

export namespace App {
  export interface Storage extends AppStorage {}
  export type StorageFolderName = AppStorageFolderName
  export interface MultiStorage<T> extends AppMultiStorage<T> {}
  export type MultiStorageOptions<T> = AppMultiStorageOptions<T>

  export interface Api extends AppApi {}

  export type FrontendFeeTier = AppFrontendFeeTier
  export type FrontendFeesResponse = AppFrontendFeesResponse
  export type FrontendProtocolParamsResponse = AppProtocolParamsResponse
}
export namespace Swap {
  export interface Api extends SwapApi {}
  export type Manager = SwapManager

  export type OpenOrder = SwapOpenOrder
  export type CompletedOrder = SwapCompletedOrder
  export type CreateOrderData = SwapCreateOrderData
  export type CancelOrderData = SwapCancelOrderData
  export type Order = SwapOpenOrder | SwapCompletedOrder
  export type CreateOrderResponse = SwapCreateOrderResponse
  export type OpenOrderResponse = SwapOpenOrder[]
  export type CompletedOrderResponse = SwapCompletedOrder[]
  export type OrderType = SwapOrderType

  export type Protocol = SwapProtocol

  export type Aggregator = SwapAggregator

  export type Pool = SwapPool
  export type PoolResponse = SwapPool[]
  export type PoolProvider = SwapPoolProvider
  export type SupportedProvider = SwapSupportedProvider

  export type Storage = SwapStorage
}

export namespace Balance {
  export type Token = BalanceToken
  export type TokenInfo = BalanceToken['info']
  export type TokenPrice = BalanceToken['price']
  export type TokenSupply = BalanceToken['supply']
  export type TokenStatus = BalanceToken['status']

  export type CardanoMetadatas = BalanceCardanoMetadatas

  export type Quantity = BalanceQuantity
  export type Amount = BalanceAmount
  export type Amounts = BalanceAmounts
}

export namespace Numbers {
  export type Locale = NumberLocale
}

export * from './helpers/types'
export * from './helpers/storage'
