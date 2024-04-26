import {PortfolioTokenInfo} from './info'
import {PortfolioTokenId} from './token'

export type PortfolioTokenAmountRecords = {
  [key: PortfolioTokenId]: PortfolioTokenAmount
}

export type PortfolioTokenAmount = {
  info: PortfolioTokenInfo
  quantity: bigint
}

export type PortfolioPrimaryBreakdown = {
  // TX
  // stated
  totalFromTxs: bigint

  // EPOCH/TX
  // derived
  availableRewards: bigint
  // inferred
  lockedAsStorageCost: bigint // required on utxos to keep tokens (storage cost)
}
