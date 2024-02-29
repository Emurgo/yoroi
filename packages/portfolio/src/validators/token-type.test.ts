import {Portfolio} from '@yoroi/types'

import {isTokenType, parseTokenType} from './token-type'

describe('isTokenType', () => {
  it('should return true for valid token types', () => {
    expect(isTokenType(Portfolio.Token.Type.FT)).toBe(true)
    expect(isTokenType(Portfolio.Token.Type.NFT)).toBe(true)
  })

  it('should return false for invalid token types', () => {
    expect(isTokenType('invalid')).toBe(false)
    expect(isTokenType(123)).toBe(false)
  })
})

describe('parseTokenType', () => {
  it('should return the token type for valid token types', () => {
    expect(parseTokenType(Portfolio.Token.Type.FT)).toBe(
      Portfolio.Token.Type.FT,
    )
    expect(parseTokenType(Portfolio.Token.Type.FT)).toBe(
      Portfolio.Token.Type.FT,
    )
  })

  it('should return undefined for invalid token types', () => {
    expect(parseTokenType('invalid')).toBeUndefined()
    expect(parseTokenType(123)).toBeUndefined()
  })
})
