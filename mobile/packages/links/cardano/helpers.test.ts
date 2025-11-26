import {
  classifyCardanoAddress,
  isCardanoAddress,
  isCardanoAddressV1,
  isCardanoBlockV1,
  isCardanoBrowseV1,
  isCardanoClaimV1,
  isCardanoConnectV1,
  isCardanoPayV1,
  isCardanoPaymentV1,
  isCardanoStakeV1,
  isCardanoTransactionV1,
  isCardanoWalletV1,
  validateCardanoAddress,
} from './helpers'

describe('helpers', () => {
  describe('classifyCardanoAddress', () => {
    it('should classify stake addresses', () => {
      const result = classifyCardanoAddress('stake1test')
      expect(result.type).toBe('stake')
      expect(result.is_testnet).toBe(false)

      const testnetResult = classifyCardanoAddress('stake_test1test')
      expect(testnetResult.type).toBe('stake')
      expect(testnetResult.is_testnet).toBe(true)
    })

    it('should classify shelley addresses', () => {
      const mainnetResult = classifyCardanoAddress('addr1test')
      expect(mainnetResult.type).toBe('shelley')
      expect(mainnetResult.is_testnet).toBe(false)

      const testnetResult = classifyCardanoAddress('addr_test1test')
      expect(testnetResult.type).toBe('shelley')
      expect(testnetResult.is_testnet).toBe(true)
    })

    it('should classify byron icarus addresses', () => {
      const result = classifyCardanoAddress('Ae2test')
      expect(result.type).toBe('byron_icarus')
      expect(result.is_testnet).toBe(false)

      const testnetResult = classifyCardanoAddress('Ae2_testtest')
      expect(testnetResult.type).toBe('byron_icarus')
      expect(testnetResult.is_testnet).toBe(true)
    })

    it('should classify byron daedalus addresses', () => {
      const result = classifyCardanoAddress('DdzFFtest')
      expect(result.type).toBe('byron_daedalus')
      expect(result.is_testnet).toBe(false)

      const testnetResult = classifyCardanoAddress('DdzFF_testtest')
      expect(testnetResult.type).toBe('byron_daedalus')
      expect(testnetResult.is_testnet).toBe(true)
    })

    it('should classify CIP-105 addresses', () => {
      const prefixes = [
        'drep_vk',
        'drep_script',
        'drep',
        'cc_cold_vk',
        'cc_cold_script',
        'cc_cold',
        'cc_hot_vk',
        'cc_hot_script',
        'cc_hot',
      ]
      prefixes.forEach((prefix) => {
        const result = classifyCardanoAddress(`${prefix}test`)
        expect(result.valid).toBe(true)
        expect(result.type).toBe(prefix)
      })
    })

    it('should return invalid for unknown address types', () => {
      const result = classifyCardanoAddress('unknown')
      expect(result.valid).toBe(false)
    })
  })

  describe('validateCardanoAddress', () => {
    it('should return true for valid addresses', () => {
      // Valid testnet address from existing tests
      const validTestnetAddress =
        'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km'
      expect(validateCardanoAddress(validTestnetAddress)).toBe(true)

      // Valid stake address (for CIP-105 addresses, validation is simpler)
      expect(validateCardanoAddress('drep_vktest')).toBe(true)
      expect(validateCardanoAddress('drep_script')).toBe(true)
      expect(validateCardanoAddress('cc_cold_vk')).toBe(true)
    })

    it('should return false for invalid addresses', () => {
      expect(validateCardanoAddress('invalid')).toBe(false)
    })

    it('should return false for non-string values', () => {
      expect(validateCardanoAddress(123 as any)).toBe(false)
      expect(validateCardanoAddress(null as any)).toBe(false)
    })
  })

  describe('isCardanoAddress', () => {
    it('should return true for valid address format', () => {
      expect(isCardanoAddress('addr1test123')).toBe(true)
      expect(isCardanoAddress('stake1test')).toBe(true)
    })

    it('should return false for invalid format', () => {
      expect(isCardanoAddress('addr@test')).toBe(false)
      expect(isCardanoAddress('')).toBe(false)
    })

    it('should return false for non-string values', () => {
      expect(isCardanoAddress(123 as any)).toBe(false)
    })
  })

  describe('authority detection functions', () => {
    describe('isCardanoClaimV1', () => {
      it('should return true for valid claim URL', () => {
        const url = new URL('web+cardano://claim/v1')
        expect(isCardanoClaimV1(url)).toBe(true)
      })

      it('should throw for unsupported version', () => {
        const url = new URL('web+cardano://claim/v2')
        expect(() => isCardanoClaimV1(url)).toThrow()
      })

      it('should return false for different authority', () => {
        const url = new URL('web+cardano://pay/v1')
        expect(isCardanoClaimV1(url)).toBe(false)
      })
    })

    describe('isCardanoBrowseV1', () => {
      it('should return true for valid browse URL', () => {
        const url = new URL('web+cardano://browse/v1/test')
        expect(isCardanoBrowseV1(url)).toBe(true)
      })

      it('should throw for unsupported version', () => {
        const url = new URL('web+cardano://browse/v2/test')
        expect(() => isCardanoBrowseV1(url)).toThrow()
      })
    })

    describe('isCardanoPayV1', () => {
      it('should return true for valid pay URL', () => {
        const url = new URL('web+cardano://pay/v1')
        expect(isCardanoPayV1(url)).toBe(true)
      })

      it('should throw for unsupported version', () => {
        const url = new URL('web+cardano://pay/v2')
        expect(() => isCardanoPayV1(url)).toThrow()
      })
    })

    describe('isCardanoPaymentV1', () => {
      it('should return true for valid payment URL', () => {
        const url = new URL('web+cardano://payment/v1')
        expect(isCardanoPaymentV1(url)).toBe(true)
      })

      it('should throw for unsupported version', () => {
        const url = new URL('web+cardano://payment/v2')
        expect(() => isCardanoPaymentV1(url)).toThrow()
      })
    })

    describe('isCardanoStakeV1', () => {
      it('should return true for valid stake URL', () => {
        const url = new URL('web+cardano://stake/v1')
        expect(isCardanoStakeV1(url)).toBe(true)
      })

      it('should throw for unsupported version', () => {
        const url = new URL('web+cardano://stake/v2')
        expect(() => isCardanoStakeV1(url)).toThrow()
      })
    })

    describe('isCardanoTransactionV1', () => {
      it('should return true for valid transaction URL', () => {
        const url = new URL('web+cardano://transaction/v1/hash123')
        expect(isCardanoTransactionV1(url)).toBe(true)
      })

      it('should throw for unsupported version', () => {
        const url = new URL('web+cardano://transaction/v2/hash123')
        expect(() => isCardanoTransactionV1(url)).toThrow()
      })
    })

    describe('isCardanoBlockV1', () => {
      it('should return true for valid block URL', () => {
        const url = new URL('web+cardano://block/v1')
        expect(isCardanoBlockV1(url)).toBe(true)
      })

      it('should throw for unsupported version', () => {
        const url = new URL('web+cardano://block/v2')
        expect(() => isCardanoBlockV1(url)).toThrow()
      })
    })

    describe('isCardanoAddressV1', () => {
      it('should return true for valid address URL', () => {
        const url = new URL('web+cardano://address/v1/addr123')
        expect(isCardanoAddressV1(url)).toBe(true)
      })

      it('should throw for unsupported version', () => {
        const url = new URL('web+cardano://address/v2/addr123')
        expect(() => isCardanoAddressV1(url)).toThrow()
      })
    })

    describe('isCardanoConnectV1', () => {
      it('should return true for valid connect URL', () => {
        const url = new URL('web+cardano://connect/v1')
        expect(isCardanoConnectV1(url)).toBe(true)
      })

      it('should throw for unsupported version', () => {
        const url = new URL('web+cardano://connect/v2')
        expect(() => isCardanoConnectV1(url)).toThrow()
      })
    })

    describe('isCardanoWalletV1', () => {
      it('should return true for valid wallet URL', () => {
        const url = new URL('web+cardano://wallet/v1')
        expect(isCardanoWalletV1(url)).toBe(true)
      })

      it('should throw for unsupported version', () => {
        const url = new URL('web+cardano://wallet/v2')
        expect(() => isCardanoWalletV1(url)).toThrow()
      })
    })
  })
})
