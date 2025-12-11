import {Branded} from '@yoroi/types'

import {primaryTokenId} from '../constants'
import {normalizeTokenId} from './normalize-token-id'

describe('normalizeTokenId', () => {
  it('should return primaryTokenId for legacy PT token IDs', () => {
    expect(normalizeTokenId(primaryTokenId)).toBe(primaryTokenId)
    expect(normalizeTokenId('')).toBe(primaryTokenId)
    expect(normalizeTokenId('.')).toBe(primaryTokenId)
  })

  it('should convert valid token identifiers using Branded.asPortfolioTokenId', () => {
    const validId = 'deadbeef.123456'
    const result = normalizeTokenId(validId)
    expect(result).toBe(Branded.asPortfolioTokenId(validId))
  })

  it('should handle token identifiers without periods', () => {
    const idWithoutPeriod = 'deadbeef123456'
    const result = normalizeTokenId(idWithoutPeriod)
    expect(result).toBe(Branded.asPortfolioTokenId(idWithoutPeriod))
  })
})
