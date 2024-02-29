import {tokenInfoMocks} from '../adapters/token-info.mocks'
import {
  isPrimaryTokenInfo,
  isSecondaryTokenInfo,
  isTokenInfo,
  parseTokenInfo,
} from './token-info'

describe('isPrimaryTokenInfo', () => {
  it('should return true for valid primary token info', () => {
    const result = isPrimaryTokenInfo(tokenInfoMocks.primaryETH)
    expect(result).toBe(true)
  })

  it('should return false for invalid primary token info', () => {
    const result = isPrimaryTokenInfo(tokenInfoMocks.nftCryptoKitty)
    expect(result).toBe(false)
  })
})

describe('isSecondaryTokenInfo', () => {
  it('should return true for valid secondary token info', () => {
    const result = isSecondaryTokenInfo(tokenInfoMocks.nftCryptoKitty)
    expect(result).toBe(true)
  })

  it('should return false for invalid secondary token info', () => {
    const result = isSecondaryTokenInfo(tokenInfoMocks.primaryETH)
    expect(result).toBe(false)
  })
})

describe('isTokenInfo', () => {
  it('should return true for valid token info', () => {
    const primaryTokenInfo = tokenInfoMocks.primaryETH
    const secondaryTokenInfo = tokenInfoMocks.nftCryptoKitty
    const result1 = isTokenInfo(primaryTokenInfo)
    const result2 = isTokenInfo(secondaryTokenInfo)
    expect(result1).toBe(true)
    expect(result2).toBe(true)
  })

  it('should return false for invalid token info', () => {
    const invalidTokenInfo = {foo: 'bar'}
    const result = isTokenInfo(invalidTokenInfo)
    expect(result).toBe(false)
  })
})

describe('parseTokenInfo', () => {
  it('should return token info for valid input', () => {
    const primaryTokenInfo = tokenInfoMocks.primaryETH
    const secondaryTokenInfo = tokenInfoMocks.nftCryptoKitty
    const result1 = parseTokenInfo(primaryTokenInfo)
    const result2 = parseTokenInfo(secondaryTokenInfo)
    expect(result1).toEqual(primaryTokenInfo)
    expect(result2).toEqual(secondaryTokenInfo)
  })

  it('should return undefined for invalid input', () => {
    const invalidTokenInfo = {foo: 'bar'}
    const result = parseTokenInfo(invalidTokenInfo)
    expect(result).toBeUndefined()
  })
})
