import {PortfolioTokenId} from './token'

export type PortfolioAmounts = {
  [key: PortfolioTokenId]: BigInt
}

export type PortfolioAmount = {
  id: PortfolioTokenId
  quantity: BigInt
}

export type PortfolioTokenBalance = {
  id: PortfolioTokenId
  // remote
  balance: BigInt
  // local - dynamic per transactions
  lockedInBuiltTx: BigInt // built txs - not submitted
}

export type PortfolioBalancePrimaryRecord = {
  source: 'rewards' | 'deposit'
  quantity: BigInt
  redeemableAfter: number // 0 means anytime with withdrawal, epoch or infinity means anytime with reverse tx
}

export type PortfolioBalancePrimaryBreakdown = {
  // local - dynamic per epoch
  minRequiredByTokens: BigInt // required on utxos to keep tokens (storage cost)
  // remote - dynamic per epoch
  records: ReadonlyArray<PortfolioBalancePrimaryRecord>
}
