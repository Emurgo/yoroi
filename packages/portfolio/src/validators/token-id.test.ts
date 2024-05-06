import {Portfolio} from '@yoroi/types'

import {isTokenId, parseTokenId} from './token-id'

describe('isTokenId', () => {
  it('should return true for valid token id', () => {
    const tokenId: Portfolio.Token.Id = 'dead.'
    expect(isTokenId(tokenId)).toBe(true)
  })

  it('should return false for invalid token id', () => {
    const tokenId: Portfolio.Token.Id = 'invalid_token_id' as any
    expect(isTokenId(tokenId)).toBe(false)
  })

  it('should return false for non-string input', () => {
    const tokenId: unknown = 123
    expect(isTokenId(tokenId)).toBe(false)
  })
})

describe('parseTokenId', () => {
  it('should return token id for valid input', () => {
    const tokenId: unknown = 'dead.'
    expect(parseTokenId(tokenId)).toBe(tokenId)
  })

  it('should return undefined for invalid input', () => {
    const tokenId: unknown = 'invalid_token_id'
    expect(parseTokenId(tokenId)).toBeUndefined()
  })

  it('should return undefined for non-string input', () => {
    const tokenId: unknown = 123
    expect(parseTokenId(tokenId)).toBeUndefined()
  })
})
