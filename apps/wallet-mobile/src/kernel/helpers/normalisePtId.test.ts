import {primaryTokenId, tokenInfoMocks} from '@yoroi/portfolio'

import {normalisePtId} from './normalisePtId'

describe('normalisePtId', () => {
  it('should return primaryTokenId for legacy token IDs', () => {
    expect(normalisePtId('')).toBe(primaryTokenId)
    expect(normalisePtId('.')).toBe(primaryTokenId)
    expect(normalisePtId(primaryTokenId)).toBe(primaryTokenId)
  })

  it('should return the tokenId if it is valid', () => {
    expect(normalisePtId(tokenInfoMocks.ftNoTicker.id)).toBe(tokenInfoMocks.ftNoTicker.id)
  })

  it('should append a period to invalid token IDs', () => {
    expect(normalisePtId('invalidTokenId')).toBe('invalidTokenId.')
  })
})
