import {storageSerializer} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'

import {deserializers} from './deserializers'
import {tokenDiscoveryMocks} from '../adapters/token-discovery.mocks'
import {tokenBalanceMocks} from '../adapters/token-balance.mocks'

describe('deserializers', () => {
  describe('tokenDiscovery', () => {
    it('should deserialize valid JSON string', () => {
      const record: Portfolio.Token.Discovery = tokenDiscoveryMocks.primaryETH

      const jsonString = storageSerializer(record)
      const result = deserializers.tokenDiscovery(jsonString)
      expect(result).toEqual(tokenDiscoveryMocks.primaryETH)
    })

    it('should return null for null input', () => {
      const jsonString = null
      const result = deserializers.tokenDiscovery(jsonString)
      expect(result).toBeNull()
    })

    it('should return null for invalid JSON string', () => {
      const jsonString = 'invalid-json'
      const result = deserializers.tokenDiscovery(jsonString)
      expect(result).toBeNull()
    })
  })

  describe('tokenAmount', () => {
    it('should deserialize valid JSON string', () => {
      const jsonString = storageSerializer(tokenBalanceMocks.primaryETH)
      const result = deserializers.tokenAmount(jsonString)
      expect(result).toEqual(tokenBalanceMocks.primaryETH)
    })

    it('should return null for null input', () => {
      const jsonString = null
      const result = deserializers.tokenAmount(jsonString)
      expect(result).toBeNull()
    })

    it('should return null for invalid JSON string', () => {
      const jsonString = 'invalid-json'
      const result = deserializers.tokenAmount(jsonString)
      expect(result).toBeNull()
    })
  })

  describe('primaryBreakdown', () => {
    it('should deserialize valid JSON string', () => {
      const jsonString = storageSerializer(
        tokenBalanceMocks.primaryETHBreakdown,
      )
      const result = deserializers.primaryBreakdown(jsonString)
      expect(result).toEqual(tokenBalanceMocks.primaryETHBreakdown)
    })

    it('should return null for null input', () => {
      const jsonString = null
      const result = deserializers.primaryBreakdown(jsonString)
      expect(result).toBeNull()
    })

    it('should return null for invalid JSON string', () => {
      const jsonString = 'invalid-json'
      const result = deserializers.primaryBreakdown(jsonString)
      expect(result).toBeNull()
    })
  })
})
