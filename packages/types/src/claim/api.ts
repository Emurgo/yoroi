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
