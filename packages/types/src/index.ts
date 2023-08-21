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
  SwapCreateOrderData,
  SwapCreateOrderResponse,
  SwapOpenOrder,
  SwapOrderType,
} from './swap/order'
import {SwapPool} from './swap/pool'
import {SwapStorage} from './swap/storage'
import {SwapManager} from './swap/manager'
import {AppStorage, AppStorageFolderName} from './app/storage'
import {AppMultiStorage, AppMultiStorageOptions} from './app/multi-storage'

export namespace App {
  export interface Storage extends AppStorage {}
  export type StorageFolderName = AppStorageFolderName
  export interface MultiStorage<T> extends AppMultiStorage<T> {}
  export type MultiStorageOptions<T> = AppMultiStorageOptions<T>
}
export namespace Swap {
  export type CreateOrderData = SwapCreateOrderData
  export type CreateOrderResponse = SwapCreateOrderResponse
  export type CancelOrderData = SwapCancelOrderData
  export type OrderType = SwapOrderType
  export type Protocol = SwapProtocol
  export type OpenOrder = SwapOpenOrder
  export type Pool = SwapPool
  export interface Api extends SwapApi {}
  export type Manager = SwapManager

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

export * from './helpers/types'
