import {tokenMocks} from '@yoroi/portfolio'

import {ClaimApiClaimTokensResponse} from './types'

const claimTokens: Record<string, {[key: string]: ClaimApiClaimTokensResponse}> = {
  success: {
    accepted: {
      status: 'accepted',
      lovelaces: '2000000',
      tokens: {
        [tokenMocks.nftCryptoKitty.info.id]: '44',
        [tokenMocks.rnftWhatever.info.id]: '410',
      },
      queue_position: 100,
    },
    queued: {
      lovelaces: '2000000',
      tokens: {
        [tokenMocks.nftCryptoKitty.info.id]: '44',
        [tokenMocks.rnftWhatever.info.id]: '410',
      },
      status: 'queued',
      queue_position: 1,
    },
    claimed: {
      lovelaces: '2000000',
      tokens: {
        [tokenMocks.nftCryptoKitty.info.id]: '44',
        [tokenMocks.rnftWhatever.info.id]: '410',
      },

      status: 'claimed',
      tx_hash: 'tx_hash',
    },
  },
} as const

export const claimFaucetResponses = {
  claimTokens,
} as const
