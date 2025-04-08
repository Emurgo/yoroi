import {PortfolioTokenId} from '../portfolio/token'
import {SwapAggregator} from './aggregator'
import {SwapProtocol} from './protocol'

export type SwapOrder = {
  aggregator: SwapAggregator
  protocol: SwapProtocol
  placedAt?: number
  lastUpdate?: number
  status: 'open' | 'matched' | 'canceled' | 'partially_matched'
  tokenIn: PortfolioTokenId
  tokenOut: PortfolioTokenId
  amountIn: number
  actualAmountOut: number
  expectedAmountOut: number
  txHash: string
  outputIndex?: number
  updateTxHash?: string
  customId?: string
}
