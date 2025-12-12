import {ClaimTokensApiResponseSchema} from './validators'

describe('ClaimTokensApiResponseSchema', () => {
  it('should validate accepted status response', () => {
    const valid = {
      status: 'accepted',
      queue_position: 1,
      lovelaces: '1000000',
      tokens: {token1: '100'},
    }

    const result = ClaimTokensApiResponseSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('should validate queued status response', () => {
    const valid = {
      status: 'queued',
      queue_position: 5,
      lovelaces: '2000000',
      tokens: {},
    }

    const result = ClaimTokensApiResponseSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('should validate claimed status response', () => {
    const valid = {
      status: 'claimed',
      tx_hash: 'abc123',
      lovelaces: '3000000',
      tokens: {token1: '200'},
    }

    const result = ClaimTokensApiResponseSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('should reject invalid lovelaces format', () => {
    const invalid = {
      status: 'accepted',
      queue_position: 1,
      lovelaces: 'invalid',
      tokens: {},
    }

    const result = ClaimTokensApiResponseSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject invalid tokens format', () => {
    const invalid = {
      status: 'accepted',
      queue_position: 1,
      lovelaces: '1000000',
      tokens: {token1: 'invalid'},
    }

    const result = ClaimTokensApiResponseSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject missing required fields', () => {
    const invalid = {
      status: 'accepted',
    }

    const result = ClaimTokensApiResponseSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})
