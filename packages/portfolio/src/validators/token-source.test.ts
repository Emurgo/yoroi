import {Portfolio} from '@yoroi/types'

import {isTokenSource, parseTokenSource} from './token-source'

describe('isTokenSource', () => {
  it('should return true for valid token source', () => {
    const validTokenSource: Portfolio.Token.Source =
      Portfolio.Token.Source.Datum
    expect(isTokenSource(validTokenSource)).toBe(true)
  })

  it('should return false for invalid token source', () => {
    const invalidTokenSource: any = 'invalid'
    expect(isTokenSource(invalidTokenSource)).toBe(false)
  })
})

describe('parseTokenSource', () => {
  it('should return valid token source', () => {
    const validTokenSource: Portfolio.Token.Source =
      Portfolio.Token.Source.Datum
    expect(parseTokenSource(validTokenSource)).toBe(validTokenSource)
  })

  it('should return undefined for invalid token source', () => {
    const invalidTokenSource: any = 'INVALID'
    expect(parseTokenSource(invalidTokenSource)).toBeUndefined()
  })
})
