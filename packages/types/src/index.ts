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
import {SwapPool, SwapPoolProvider} from './swap/pool'
import {SwapStorage} from './swap/storage'
import {SwapManager} from './swap/manager'
import {AppStorage, AppStorageFolderName} from './app/storage'
import {AppMultiStorage, AppMultiStorageOptions} from './app/multi-storage'
import {PortfolioBalance, PortfolioBalanceRecords} from './portfolio/balance'
import {
  PortfolioToken,
  PortfolioTokenRecords,
  PortfolioTokenStatus,
} from './portfolio/token'
import {PortfolioTokenFile} from './portfolio/token-file'
import {
  PortfolioAmount,
  PortfolioAmounts,
  PortfolioQuantity,
} from './portfolio/amount'
import {PortfolioTokenSupply} from './portfolio/token-supply'
import {PortfolioTokenInfo} from './portfolio/token-info'
import {PortfolioTokenPrice} from './portfolio/token-price'

export namespace App {
  export interface Storage extends AppStorage {}
  export type StorageFolderName = AppStorageFolderName
  export interface MultiStorage<T> extends AppMultiStorage<T> {}
  export type MultiStorageOptions<T> = AppMultiStorageOptions<T>
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

  export type Pool = SwapPool
  export type PoolResponse = SwapPool[]
  export type PoolProvider = SwapPoolProvider

  export type Storage = SwapStorage
}

export namespace Portfolio {
  export type Token<M extends Record<string, unknown> = {}> = PortfolioToken<M>
  export type TokenInfo = PortfolioTokenInfo
  export type TokenPrice = PortfolioTokenPrice
  export type TokenSupply = PortfolioTokenSupply
  export type TokenStatus = PortfolioTokenStatus
  export type TokenFiles = Array<PortfolioToken>
  export type TokenFile = PortfolioTokenFile
  export type TokenRecords<M extends Record<string, unknown> = {}> =
    PortfolioTokenRecords<M>

  export type Quantity = PortfolioQuantity
  export type Amount = PortfolioAmount
  export type Amounts = PortfolioAmounts

  export type Balance = PortfolioBalance
  export type BalanceRecords = PortfolioBalanceRecords
}

export * from './helpers/types'
