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
import {
  SwapFactoryOptions,
  SwapOrderCreateData,
  SwapOrderType,
  SwapProtocol,
  SwapSlippageOptions,
} from './swap/module'
import {SwapStorage} from './swap/storage'

export namespace Metrics {
  export type Module<EventOptions> = MetricsModule<EventOptions>
  export type FactoryOptions<InitOptions> = MetricsFactoryOptions<InitOptions>

  export type Track<Properties> = MetricsTrack<Properties>

  export type Storage = MetricsStorage
}

export namespace Swap {
  export type FactoryOptions = SwapFactoryOptions
  export type SlippageOptions = SwapSlippageOptions

  export type CreateOrderData = SwapOrderCreateData
  export type OrderType = SwapOrderType
  export type Protocol = SwapProtocol

  export type Storage = SwapStorage
}

export namespace Balance {
  export type Token = BalanceToken
  export type TokenInfo = BalanceToken['info']
  export type TokenPrice = BalanceToken['price']

  export type CardanoMetadatas = BalanceCardanoMetadatas

  export type Quantity = BalanceQuantity
  export type Amount = BalanceAmount
  export type Amounts = BalanceAmounts
}
