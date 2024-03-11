import {cacheRecordMaker, storageSerializer} from '@yoroi/common'
import {deserializer} from './deserializer'
import {tokenDiscoveryMocks} from '../adapters/token-discovery.mocks'
import {tokenBalanceMocks} from '../adapters/token-balance.mocks'

describe('deserializer', () => {
  describe('tokenDiscovery', () => {
    it('should deserialize valid JSON string', () => {
      const record = cacheRecordMaker(
        {expires: 1, hash: 'hash'},
        tokenDiscoveryMocks.primaryETH,
      )
      const jsonString = storageSerializer(record)
      const result = deserializer.tokenDiscoveryWithCache(jsonString)
      expect(result).toEqual(record)
    })

    it('should return null for null input', () => {
      const jsonString = null
      const result = deserializer.tokenDiscoveryWithCache(jsonString)
      expect(result).toBeNull()
    })

    it('should return null for invalid JSON string', () => {
      const jsonString = 'invalid-json'
      const result = deserializer.tokenDiscoveryWithCache(jsonString)
      expect(result).toBeNull()
    })
  })

  describe('tokenBalance', () => {
    it('should deserialize valid JSON string', () => {
      const jsonString = storageSerializer(tokenBalanceMocks.primaryETH)
      const result = deserializer.tokenBalance(jsonString)
      expect(result).toEqual(tokenBalanceMocks.primaryETH)
    })

    it('should return null for null input', () => {
      const jsonString = null
      const result = deserializer.tokenBalance(jsonString)
      expect(result).toBeNull()
    })

    it('should return null for invalid JSON string', () => {
      const jsonString = 'invalid-json'
      const result = deserializer.tokenBalance(jsonString)
      expect(result).toBeNull()
    })
  })

  describe('primaryBreakdown', () => {
    it('should deserialize valid JSON string', () => {
      const jsonString = storageSerializer(
        tokenBalanceMocks.primaryETHBreakdown,
      )
      const result = deserializer.primaryBreakdown(jsonString)
      expect(result).toEqual(tokenBalanceMocks.primaryETHBreakdown)
    })

    it('should return null for null input', () => {
      const jsonString = null
      const result = deserializer.primaryBreakdown(jsonString)
      expect(result).toBeNull()
    })

    it('should return null for invalid JSON string', () => {
      const jsonString = 'invalid-json'
      const result = deserializer.primaryBreakdown(jsonString)
      expect(result).toBeNull()
    })
  })
})
