import {BalanceAmount} from '../balance/token'
import {SwapProtocol} from './protocol'

export type SwapOrderType = 'market' | 'limit'

export type SwapCreateOrderData = {
  amounts: {
    sell: BalanceAmount
    buy: BalanceAmount
  }
  address: string
  slippage: number
} & (
  | {
      protocol: Omit<SwapProtocol, 'sundaeswap'>
      poolId: string | undefined // only required for SundaeSwap trades.
    }
  | {
      protocol: 'sundaeswap'
      poolId: string
    }
)

export type SwapCancelOrderData = {
  utxos: {
    order: string
    collateral: string
  }
  address: string
}

export type SwapCreateOrderResponse = {
  datum: string
  datumHash: string
  contractAddress: string
}

export type SwapOpenOrder = {
  provider: SwapProtocol
  from: BalanceAmount
  to: BalanceAmount
  deposit: BalanceAmount
  utxo: string
}
