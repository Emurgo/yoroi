import {Api, App, Portfolio} from '@yoroi/types'

import {
  isTokenDiscovery,
  parseTokenDiscovery,
  TokenDiscoveryResponseWithCacheRecordSchema,
  isTokenDiscoveryResponseWithCacheRecord,
  parseTokenDiscoveryResponseWithCacheRecord,
  parseTokenDiscoveryWithCacheRecord,
  isTokenDiscoveryWithCacheRecord,
} from './token-discovery'
import {tokenDiscoveryMocks} from '../adapters/token-discovery.mocks'

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
    const validResponse: Api.ResponseWithCache<Portfolio.Token.Discovery> = [
      200,
      tokenDiscoveryMocks.nftCryptoKitty,
      'hash',
      100,
    ]

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
    const validResponse: Api.ResponseWithCache<Portfolio.Token.Discovery> = [
      200,
      tokenDiscoveryMocks.nftCryptoKitty,
      'hash',
      100,
    ]

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

describe('parseTokenDiscoveryResponseWithCacheRecord', () => {
  it('should return a valid token discovery response with cache record', () => {
    const validResponse: Api.ResponseWithCache<Portfolio.Token.Discovery> = [
      200,
      tokenDiscoveryMocks.nftCryptoKitty,
      'hash',
      100,
    ]

    const result = parseTokenDiscoveryResponseWithCacheRecord(validResponse)

    expect(result).toEqual(validResponse)
  })

  it('should return undefined for an invalid token discovery response with cache record', () => {
    const invalidTokenDiscovery = {
      ...tokenDiscoveryMocks.primaryETH,
      id: 'invalid',
    }

    const invalidResponse = [200, invalidTokenDiscovery, 'hash', 100]

    const result = parseTokenDiscoveryResponseWithCacheRecord(invalidResponse)

    expect(result).toBeUndefined()
  })
})

describe('parseTokenDiscoveryWithCacheRecord', () => {
  it('should return a valid token discovery with cache record', () => {
    const validTokenDiscovery: Portfolio.Token.Discovery =
      tokenDiscoveryMocks.nftCryptoKitty
    const validCache: App.CacheRecord<Portfolio.Token.Discovery> = {
      hash: 'hash',
      expires: 100,
      record: validTokenDiscovery,
    }

    const result = parseTokenDiscoveryWithCacheRecord(validCache)

    expect(result).toBe(validCache)
  })

  it('should return undefined for an invalid token discovery with cache record', () => {
    const invalidTokenDiscovery = {
      ...tokenDiscoveryMocks.primaryETH,
      id: 'invalid',
    }
    const invalidCache: App.CacheRecord<Portfolio.Token.Discovery> = {
      hash: 'hash',
      expires: 100,
      record: invalidTokenDiscovery as any,
    }

    const result = parseTokenDiscoveryWithCacheRecord(invalidCache)

    expect(result).toBeUndefined()
  })
})

describe('isTokenDiscoveryWithCacheRecord', () => {
  it('should return true for a valid token discovery with cache record', () => {
    const validTokenDiscovery: Portfolio.Token.Discovery =
      tokenDiscoveryMocks.nftCryptoKitty
    const validCache: App.CacheRecord<Portfolio.Token.Discovery> = {
      hash: 'hash',
      expires: 100,
      record: validTokenDiscovery,
    }

    const result = isTokenDiscoveryWithCacheRecord(validCache)

    expect(result).toBe(true)
  })

  it('should return false for an invalid token discovery with cache record', () => {
    const invalidTokenDiscovery = {
      ...tokenDiscoveryMocks.primaryETH,
      id: 'invalid',
    }
    const invalidCache: App.CacheRecord<Portfolio.Token.Discovery> = {
      hash: 'hash',
      expires: 100,
      record: invalidTokenDiscovery as any,
    }

    const result = isTokenDiscoveryWithCacheRecord(invalidCache)

    expect(result).toBe(false)
  })
})
