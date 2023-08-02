import {
  BalanceAmount,
  BalanceAmounts,
  BalanceCardanoMetadatas,
  BalanceQuantity,
  BalanceToken,
} from './balance/token'
import {MetricsModule, MetricsFactoryOptions} from './metrics/module'
import {MetricsStorage} from './metrics/storage'
import {MetricsTrack} from './metrics/track'
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

export namespace Metrics {
  export type Module<EventOptions> = MetricsModule<EventOptions>
  export type FactoryOptions<InitOptions> = MetricsFactoryOptions<InitOptions>

  export type Track<Properties> = MetricsTrack<Properties>

  export type Storage = MetricsStorage
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
