import {PortfolioTokenInfo} from './info'
import {PortfolioTokenId} from './token'

export type PortfolioAmounts = {
  [key: PortfolioTokenId]: BigInt
}

export type PortfolioAmount = {
  id: PortfolioTokenId
  quantity: BigInt
}

export type PortfolioTokenBalance = {
  info: PortfolioTokenInfo
  // remote
  balance: BigInt
  // local - dynamic per transactions
  lockedInBuiltTxs: BigInt // built txs - not submitted/confirmed
}

export type PortfolioBalancePrimaryRecord = {
  source: 'rewards' | 'deposit'
  quantity: BigInt
  redeemableAfter: number // 0 means anytime with withdrawal, epoch or infinity means anytime with reverse tx
}

export type PortfolioBalancePrimaryBreakdown = PortfolioTokenBalance & {
  // local - dynamic per epoch
  minRequiredByTokens: BigInt // required on utxos to keep tokens (storage cost)
  // remote - dynamic per epoch
  records: ReadonlyArray<PortfolioBalancePrimaryRecord>
}
