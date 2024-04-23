import {PortfolioTokenInfo} from './info'
import {PortfolioTokenId} from './token'

export type PortfolioAmounts = {
  [key: PortfolioTokenId]: bigint
}

export type PortfolioAmount = {
  id: PortfolioTokenId
  quantity: bigint
}

export type PortfolioTokenBalance = {
  info: PortfolioTokenInfo
  balance: bigint
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
