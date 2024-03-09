import {
  isTokenDiscovery,
  parseTokenDiscovery,
  TokenDiscoveryResponseWithCacheRecordSchema,
  isTokenDiscoveryResponseWithCacheRecord,
  parseTokenInfoResponseWithCacheRecord,
} from './token-discovery'
import {tokenDiscoveryMocks} from '../adapters/token-discovery.mocks'
import {AppApiResponseRecordWithCache} from '../types'
import {Portfolio} from '@yoroi/types'

describe('isTokenDiscovery', () => {
  it('should return true for a valid token discovery', () => {
    const validTokenDiscovery: Portfolio.Token.Discovery =
      tokenDiscoveryMocks.nftCryptoKitty

    const result = isTokenDiscovery(validTokenDiscovery)

    expect(result).toBe(true)
  })

  it('should return false for an invalid token discovery', () => {
    const invalidTokenDiscovery = {
      ...tokenDiscoveryMocks.primaryETH,
      id: 'invalid',
    }

    const result = isTokenDiscovery(invalidTokenDiscovery)

    expect(result).toBe(false)
  })
})

describe('parseTokenDiscovery', () => {
  it('should return a valid token discovery', () => {
    const validTokenDiscovery: Portfolio.Token.Discovery =
      tokenDiscoveryMocks.nftCryptoKitty

    const result = parseTokenDiscovery(validTokenDiscovery)

    expect(result).toEqual(validTokenDiscovery)
  })

  it('should return undefined for an invalid token discovery', () => {
    const invalidTokenDiscovery = {
      ...tokenDiscoveryMocks.primaryETH,
      id: 'invalid',
    }

    const result = parseTokenDiscovery(invalidTokenDiscovery)

    expect(result).toBeUndefined()
  })
})

describe('TokenDiscoveryResponseWithCacheRecordSchema', () => {
  it('should validate a valid token discovery response with cache record', () => {
    const validResponse: AppApiResponseRecordWithCache<Portfolio.Token.Discovery> =
      [200, tokenDiscoveryMocks.nftCryptoKitty, 'hash', 100]

    const result =
      TokenDiscoveryResponseWithCacheRecordSchema.safeParse(validResponse)

    expect(result.success).toBe(true)
  })

  it('should not validate an invalid token discovery response with cache record', () => {
    const invalidTokenDiscovery = {
      ...tokenDiscoveryMocks.primaryETH,
      id: 'invalid',
    }
    const invalidResponse = [200, invalidTokenDiscovery, 'hash', 100]

    const result =
      TokenDiscoveryResponseWithCacheRecordSchema.safeParse(invalidResponse)

    expect(result.success).toBe(false)
  })
})

describe('isTokenDiscoveryResponseWithCacheRecord', () => {
  it('should return true for a valid token discovery response with cache record', () => {
    const validResponse: AppApiResponseRecordWithCache<Portfolio.Token.Discovery> =
      [200, tokenDiscoveryMocks.nftCryptoKitty, 'hash', 100]

    const result = isTokenDiscoveryResponseWithCacheRecord(validResponse)

    expect(result).toBe(true)
  })

  it('should return false for an invalid token discovery response with cache record', () => {
    const invalidTokenDiscovery = {
      ...tokenDiscoveryMocks.primaryETH,
      id: 'invalid',
    }

    const invalidResponse = [200, invalidTokenDiscovery, 'hash', 100]

    const result = isTokenDiscoveryResponseWithCacheRecord(invalidResponse)

    expect(result).toBe(false)
  })
})

describe('parseTokenInfoResponseWithCacheRecord', () => {
  it('should return a valid token discovery response with cache record', () => {
    const validResponse: AppApiResponseRecordWithCache<Portfolio.Token.Discovery> =
      [200, tokenDiscoveryMocks.nftCryptoKitty, 'hash', 100]

    const result = parseTokenInfoResponseWithCacheRecord(validResponse)

    expect(result).toEqual(validResponse)
  })

  it('should return undefined for an invalid token discovery response with cache record', () => {
    const invalidTokenDiscovery = {
      ...tokenDiscoveryMocks.primaryETH,
      id: 'invalid',
    }

    const invalidResponse = [200, invalidTokenDiscovery, 'hash', 100]

    const result = parseTokenInfoResponseWithCacheRecord(invalidResponse)

    expect(result).toBeUndefined()
  })
})
