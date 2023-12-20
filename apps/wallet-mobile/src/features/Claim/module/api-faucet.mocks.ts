import {ClaimApiClaimTokensResponse} from './types'

const claimTokens: Record<string, {[key: string]: ClaimApiClaimTokensResponse}> = {
  success: {
    accepted: {
      status: 'accepted',
      lovelaces: '2000000',
      tokens: {
        '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52': '1000000',
      },
      queue_position: 100,
    },
    queued: {
      lovelaces: '2000000',
      tokens: {
        '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52': '1000000',
      },
      status: 'queued',
      queue_position: 1,
    },
    claimed: {
      lovelaces: '2000000',
      tokens: {
        '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52': '1000000',
      },
      status: 'claimed',
      tx_hash: 'tx_hash',
    },
  },
} as const

export const claimFaucetResponses = {
  claimTokens,
} as const
