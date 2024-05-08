import {storageSerializer} from '@yoroi/common'

import {deserializers} from './deserializers'
import {tokenBalanceMocks} from '../adapters/token-balance.mocks'

describe('deserializers', () => {
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
