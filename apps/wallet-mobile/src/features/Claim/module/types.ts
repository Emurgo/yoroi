import {Portfolio} from '@yoroi/types'

import {ScanActionClaim} from '../../Scan/common/types'

export type ClaimApiClaimTokensRequestPayload = {
  address: string
  code: string
  [key: string]: unknown
}

export type ClaimApiClaimTokensResponse = {
  lovelaces: string
  tokens: {
    [tokenId: string]: string
  }
} & (
  | {
      // code: 200
      status: 'accepted'
      queue_position: number
    }
  | {
      // code: 201
      status: 'queued'
      queue_position: number
    }
  | {
      // code: 202
      status: 'claimed'
      tx_hash: string
    }
)

export type ClaimStatus = 'accepted' | 'processing' | 'done'

export type ClaimInfo = Readonly<{
  // api
  status: ClaimStatus
  amounts: ReadonlyArray<Portfolio.Token.Amount>
  txHash?: string
}>

export type ClaimApi = Readonly<{
  claimTokens: (action: ScanActionClaim) => Promise<ClaimInfo>
  address: string
  primaryTokenInfo: Portfolio.Token.Info
}>

export type ClaimState = Readonly<{
  claimInfo: ClaimInfo | undefined
  scanActionClaim: ScanActionClaim | undefined
}>
