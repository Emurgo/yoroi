import {claimApiMockResponses} from './api.mocks'
import {defaultClaimState} from './state'
import {ClaimState} from './types'

const empty: ClaimState = {...defaultClaimState} as const
const withScanActionClaim: ClaimState = {
  ...defaultClaimState,
  scanActionClaim: {
    action: 'claim',
    code: 'code',
    params: {},
    url: 'https://example.com',
  },
} as const

const withClaimTokenAccepted: ClaimState = {
  ...withScanActionClaim,
  claimToken: claimApiMockResponses.claimTokens['accepted'],
} as const

const withClaimTokenProcessing: ClaimState = {
  ...withScanActionClaim,
  claimToken: claimApiMockResponses.claimTokens['processing'],
} as const

const withClaimTokenDone: ClaimState = {
  ...withScanActionClaim,
  claimToken: claimApiMockResponses.claimTokens['done'],
} as const

export const mocks = {
  empty,
  withScanActionClaim,
  withClaimTokenAccepted,
  withClaimTokenDone,
  withClaimTokenProcessing,
} as const
