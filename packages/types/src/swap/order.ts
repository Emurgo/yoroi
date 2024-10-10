import {BalanceQuantity} from '../balance/token'
import {PortfolioTokenId} from '../portfolio/token'
import {SwapPool, SwapPoolProvider} from './pool'

export type SwapOrderType = 'market' | 'limit'

export type SwapCreateOrderData = {
  amounts: {
    sell: {
      tokenId: PortfolioTokenId
      quantity: bigint
    }
    buy: {
      tokenId: PortfolioTokenId
      quantity: bigint
    }
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
  from: {
    tokenId: PortfolioTokenId
    quantity: bigint
  }
  to: {
    tokenId: PortfolioTokenId
    quantity: bigint
  }
  deposit: {
    tokenId: PortfolioTokenId
    quantity: bigint
  }
  utxo: string
  owner: string
}

export type SwapCompletedOrder = {
  from: {
    tokenId: PortfolioTokenId
    quantity: bigint
  }
  to: {
    tokenId: PortfolioTokenId
    quantity: bigint
  }
  txHash: string
  provider: SwapPoolProvider
  placedAt: number
}
