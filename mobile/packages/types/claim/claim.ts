import {Address, TransactionHash} from '../branded'
import {CardanoActionClaim} from '../links/cardano-actions'
import {PortfolioTokenAmount} from '../portfolio/amount'
import {PortfolioTokenInfo} from '../portfolio/info'

export type ClaimStatus = 'accepted' | 'processing' | 'done'

export type ClaimInfo = Readonly<{
  // api
  status: ClaimStatus
  amounts: ReadonlyArray<PortfolioTokenAmount>
  txHash?: TransactionHash
}>

export type ClaimManager = Readonly<{
  claimTokens: (action: CardanoActionClaim) => Promise<ClaimInfo>
  address: Address
  primaryTokenInfo: PortfolioTokenInfo
}>
