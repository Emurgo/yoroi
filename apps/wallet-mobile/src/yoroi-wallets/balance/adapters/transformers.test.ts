/* eslint-disable @typescript-eslint/no-explicit-any */
import {asApiTokenId, asString} from './transformers' // replace with the actual import

describe('asApiTokenId', () => {
  it('should return the same token ID if it includes a period', () => {
    const tokenId = 'policy.name'
    const result = asApiTokenId(tokenId)
    expect(result).toBe('policy.name')
  })

  it('should return with period if the token ID does not include a period', () => {
    const tokenId = 'policyname'
    const result = asApiTokenId(tokenId)
    expect(result).toBe('policyname.')
  })
})

describe('asString', () => {
  it('should return null for null input', () => {
    expect(asString(null)).toBe(null)
  })

  it('should return anything else', () => {
    expect(asString({} as any)).toBe(null)
    expect(asString(['1', 1] as any)).toBe(null)
    expect(asString(1 as any)).toBe(null)
  })

  it('should return null for undefined input', () => {
    expect(asString(undefined)).toBe(null)
  })

  it('should return the original string for string input', () => {
    expect(asString('hello')).toBe('hello')
  })

  it('should join array of strings into a single string', () => {
    expect(asString(['h', 'e', 'l', 'l', 'o'])).toBe('hello')
  })
})
