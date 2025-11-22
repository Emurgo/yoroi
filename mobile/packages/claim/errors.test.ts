import {Claim} from '@yoroi/types'

import {claimApiErrors} from './errors'

describe('claimApiErrors', () => {
  it('should contain all claim API error classes', () => {
    expect(claimApiErrors).toContain(Claim.Api.Errors.InvalidRequest)
    expect(claimApiErrors).toContain(Claim.Api.Errors.NotFound)
    expect(claimApiErrors).toContain(Claim.Api.Errors.AlreadyClaimed)
    expect(claimApiErrors).toContain(Claim.Api.Errors.Expired)
    expect(claimApiErrors).toContain(Claim.Api.Errors.TooEarly)
    expect(claimApiErrors).toContain(Claim.Api.Errors.RateLimited)
  })

  it('should be readonly array', () => {
    expect(claimApiErrors).toHaveLength(6)
  })
})
