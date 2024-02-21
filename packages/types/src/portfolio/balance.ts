import {PortfolioTokenInfo} from './info'
import {PortfolioTokenId, PortfolioTokenNature} from './token'

export type PortfolioQuantity = `${string}` // BigInt - not serializable

export type PortfolioAmounts = {
  [key: PortfolioTokenId]: PortfolioQuantity
}

export type PortfolioAmount = {
  id: PortfolioTokenId
  quantity: PortfolioQuantity
}

export type PortfolioTokenBalance = {
  info: PortfolioTokenInfo
  // remote
  balance: PortfolioQuantity
  // local - dynamic per transactions
  lockedInBuiltTx: PortfolioQuantity // built txs - not submitted
} & PortfolioTokenInfo['nature'] extends PortfolioTokenNature.Primary
  ? PortfolioBalancePrimaryBreakdown
  : never

export type PortfolioBalancePrimaryRecord = {
  source: 'rewards' | 'deposit'
  quantity: PortfolioQuantity
  redeemableAfter: number // 0 means anytime with withdrawal, epoch or infinity means anytime with reverse tx
}

export type PortfolioBalancePrimaryBreakdown = {
  // local - dynamic per epoch
  minRequiredByTokens: PortfolioQuantity // required on utxos to keep tokens (storage cost)
  // remote - dynamic per epoch
  records: ReadonlyArray<PortfolioBalancePrimaryRecord>
}
