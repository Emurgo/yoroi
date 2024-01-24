import {Balance} from '@yoroi/types'

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

export type ClaimToken = Readonly<{
  // api
  status: ClaimStatus
  amounts: Balance.Amounts
  txHash?: string
}>

export type ClaimApi = Readonly<{
  claimTokens: (action: ScanActionClaim) => Promise<ClaimToken>
  address: string
  primaryTokenId: Balance.TokenInfo['id']
}>

export type ClaimState = Readonly<{
  claimToken: ClaimToken | undefined
  scanActionClaim: ScanActionClaim | undefined
}>
