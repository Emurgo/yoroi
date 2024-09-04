import {tokenMocks} from '@yoroi/portfolio'
import {Claim} from '@yoroi/types'

const claimTokensResponse: {[key: string]: Claim.Info} = {
  accepted: {
    status: 'accepted',
    amounts: [
      {
        info: tokenMocks.primaryETH.info,
        quantity: 2_000_000n,
      },
      {
        info: tokenMocks.nftCryptoKitty.info,
        quantity: 44n,
      },
      {
        info: tokenMocks.rnftWhatever.info,
        quantity: 410n,
      },
    ],
  },
  processing: {
    status: 'processing',
    amounts: [
      {
        info: tokenMocks.primaryETH.info,
        quantity: 2_000_000n,
      },
      {
        info: tokenMocks.nftCryptoKitty.info,
        quantity: 44n,
      },
      {
        info: tokenMocks.rnftWhatever.info,
        quantity: 410n,
      },
    ],
  },
  done: {
    status: 'done',
    amounts: [
      {
        info: tokenMocks.primaryETH.info,
        quantity: 2_000_000n,
      },
      {
        info: tokenMocks.nftCryptoKitty.info,
        quantity: 44n,
      },
      {
        info: tokenMocks.rnftWhatever.info,
        quantity: 410n,
      },
    ],
    txHash: '3a27ac29f4218a4503ed241a19e59291835b38ccdb1f1f71ae4dc889d7dbfeb4',
  },
} as const

export const claimApiMockResponses = {
  claimTokens: claimTokensResponse,
} as const

const claimTokensApi = {
  success: {
    accepted: () => {
      return Promise.resolve(claimTokensResponse.accepted)
    },
    processing: () => {
      return Promise.resolve(claimTokensResponse.processing)
    },
    done: () => {
      return Promise.resolve(claimTokensResponse.done)
    },
  },
  error: () => {
    return Promise.reject(new Error('Something went wrong'))
  },
  loading: () => {
    return new Promise(() => null) as unknown as Claim.Info
  },
} as const

export const claimApiMockFetchers = {
  claimTokens: claimTokensApi,
} as const

const claimManagerError: Claim.Manager = {
  claimTokens: claimTokensApi.error,
  address: 'address',
  primaryTokenInfo: tokenMocks.primaryETH.info,
} as const

const claimManagerSuccessProcessing: Claim.Manager = {
  claimTokens: claimTokensApi.success.processing as () => Promise<Claim.Info>,
  address: 'address',
  primaryTokenInfo: tokenMocks.primaryETH.info,
} as const

export const claimManagerMockInstances = {
  error: claimManagerError,
  processing: claimManagerSuccessProcessing,
} as const
