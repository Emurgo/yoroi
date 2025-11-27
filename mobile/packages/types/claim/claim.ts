import {PortfolioTokenAmount} from '../portfolio/amount'
import {PortfolioTokenInfo} from '../portfolio/info'
import {CardanoActionClaim} from '../links/cardano-actions'

export type ClaimStatus = 'accepted' | 'processing' | 'done'

export type ClaimInfo = Readonly<{
  // api
  status: ClaimStatus
  amounts: ReadonlyArray<PortfolioTokenAmount>
  txHash?: string
}>

export type ClaimManager = Readonly<{
  claimTokens: (action: CardanoActionClaim) => Promise<ClaimInfo>
  address: string
  primaryTokenInfo: PortfolioTokenInfo
}>
