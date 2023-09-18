import {PortfolioAmount, PortfolioQuantity} from '../portfolio/amount'
import {SwapPool} from './pool'

export type SwapOrderType = 'market' | 'limit'

export type SwapCreateOrderData = {
  amounts: {
    sell: PortfolioAmount
    buy: PortfolioAmount
  }
  limitPrice?: PortfolioQuantity
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
  provider: SwapPool['provider']
  from: PortfolioAmount
  to: PortfolioAmount
  deposit: PortfolioAmount
  utxo: string
}

export type SwapCompletedOrder = {
  from: PortfolioAmount
  to: PortfolioAmount
  txHash: string
}
