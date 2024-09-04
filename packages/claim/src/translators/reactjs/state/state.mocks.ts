import {claimApiMockResponses} from '../../../manager.mocks'
import {ClaimState, defaultClaimState} from './state'

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
  claimInfo: claimApiMockResponses.claimTokens.accepted,
} as const

const withClaimTokenProcessing: ClaimState = {
  ...withScanActionClaim,
  claimInfo: claimApiMockResponses.claimTokens.processing,
} as const

const withClaimTokenDone: ClaimState = {
  ...withScanActionClaim,
  claimInfo: claimApiMockResponses.claimTokens.done,
} as const

export const mocks = {
  empty,
  withScanActionClaim,
  withClaimTokenAccepted,
  withClaimTokenDone,
  withClaimTokenProcessing,
} as const
