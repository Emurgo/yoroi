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

export type SwapAggregator = 'muesliswap'

export type SwapDiscountTier = Readonly<{
  primaryTokenValueThreshold: BalanceQuantity // primary token trade value threshold
  secondaryTokenBalanceThreshold: BalanceQuantity // secodary token balance (holding)
  variableFeeMultiplier: number
  variableFeeVisual: number
  fixedFee: BalanceQuantity
}>

export type SwapFrontendFee = Readonly<{
  [aggregator in SwapAggregator]?: {
    tiers: ReadonlyArray<SwapDiscountTier>
    lpTokens: {
      mainnet: string
      preprod: string
    }
  }
}>
