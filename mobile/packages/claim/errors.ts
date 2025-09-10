import {Claim} from '@yoroi/types'

export const claimApiErrors = [
  Claim.Api.Errors.InvalidRequest,
  Claim.Api.Errors.NotFound,
  Claim.Api.Errors.AlreadyClaimed,
  Claim.Api.Errors.Expired,
  Claim.Api.Errors.TooEarly,
  Claim.Api.Errors.RateLimited,
] as const
