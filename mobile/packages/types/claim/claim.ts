import {PortfolioTokenAmount} from '../portfolio/amount'
import {PortfolioTokenInfo} from '../portfolio/info'
import {ScanActionClaim} from '../scan/actions'

export type ClaimStatus = 'accepted' | 'processing' | 'done'

export type ClaimInfo = Readonly<{
  // api
  status: ClaimStatus
  amounts: ReadonlyArray<PortfolioTokenAmount>
  txHash?: string
}>

export type ClaimManager = Readonly<{
  claimTokens: (action: ScanActionClaim) => Promise<ClaimInfo>
  address: string
  primaryTokenInfo: PortfolioTokenInfo
}>
