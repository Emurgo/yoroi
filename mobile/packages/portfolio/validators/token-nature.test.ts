import {Portfolio} from '@yoroi/types'

import {isTokenNature, parseTokenNature} from './token-nature'

describe('isTokenNature', () => {
  it('should return true for valid token nature', () => {
    const validTokenNature: Portfolio.Token.Nature =
      Portfolio.Token.Nature.Primary
    expect(isTokenNature(validTokenNature)).toBe(true)
  })

  it('should return false for invalid token nature', () => {
    const invalidTokenNature: string = 'InvalidTokenNature'
    expect(isTokenNature(invalidTokenNature)).toBe(false)
  })

  it('should return false for undefined', () => {
    const undefinedTokenNature: undefined = undefined
    expect(isTokenNature(undefinedTokenNature)).toBe(false)
  })
})

describe('parseTokenNature', () => {
  it('should return valid token nature', () => {
    const validTokenNature: Portfolio.Token.Nature =
      Portfolio.Token.Nature.Primary
    expect(parseTokenNature(validTokenNature)).toBe(validTokenNature)
  })

  it('should return undefined for invalid token nature', () => {
    const invalidTokenNature: string = 'InvalidTokenNature'
    expect(parseTokenNature(invalidTokenNature)).toBeUndefined()
  })

  it('should return undefined for undefined', () => {
    const undefinedTokenNature: undefined = undefined
    expect(parseTokenNature(undefinedTokenNature)).toBeUndefined()
  })
})
