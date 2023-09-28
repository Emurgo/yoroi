import {BalanceAmount, BalanceQuantity} from '../balance/token'
import {SwapPool, SwapPoolProvider} from './pool'

export type SwapOrderType = 'market' | 'limit'

export type SwapCreateOrderData = {
  amounts: {
    sell: BalanceAmount
    buy: BalanceAmount
  }
  limitPrice?: BalanceQuantity
  address: string
  slippage: number
  selectedPool: SwapPool
}

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
  provider: SwapPoolProvider
  from: BalanceAmount
  to: BalanceAmount
  deposit: BalanceAmount
  utxo: string
  owner: string
}

export type SwapCompletedOrder = {
  from: BalanceAmount
  to: BalanceAmount
  txHash: string
}
