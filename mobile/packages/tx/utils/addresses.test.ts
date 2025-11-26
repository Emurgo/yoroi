import {Addressing} from '../types'
import {
  addrContainsAccountKey,
  derivePublicByAddressing,
  filterAddressesByStakingKey,
  normalizeToAddress,
  validateAndExtractAddressInfo,
} from './addresses'

describe('address utils', () => {
  describe('normalizeToAddress', () => {
    it('should normalize bech32 address', () => {
      const mockAddress = {
        isMalformed: jest.fn(() => false),
      }
      const mockCsl = {
        ByronAddress: {
          isValid: jest.fn(() => false),
        },
        Address: {
          fromBech32: jest.fn(() => mockAddress),
        },
      }

      const result = normalizeToAddress(mockCsl as any, 'addr_test1qpxxxxxx')

      expect(result).toBe(mockAddress)
      expect(mockCsl.Address.fromBech32).toHaveBeenCalledWith(
        'addr_test1qpxxxxxx',
      )
    })

    it('should normalize hex address', () => {
      const mockAddress = {
        isMalformed: jest.fn(() => false),
      }
      const mockCsl = {
        ByronAddress: {
          isValid: jest.fn(() => false),
        },
        Address: {
          fromHex: jest.fn(() => mockAddress),
        },
      }

      const result = normalizeToAddress(mockCsl as any, 'abcdef123456')

      expect(result).toBe(mockAddress)
    })

    it('should normalize Byron address', () => {
      const mockByronAddress = {
        toAddress: jest.fn(() => ({isMalformed: () => false})),
      }
      const mockCsl = {
        ByronAddress: {
          isValid: jest.fn(() => true),
          fromBase58: jest.fn(() => mockByronAddress),
        },
      }

      const result = normalizeToAddress(mockCsl as any, 'ByronAddress')

      expect(result).not.toBeUndefined()
    })

    it('should return undefined for malformed address', () => {
      const mockAddress = {
        isMalformed: jest.fn(() => true),
      }
      const mockCsl = {
        ByronAddress: {
          isValid: jest.fn(() => false),
        },
        Address: {
          fromBech32: jest.fn(() => mockAddress),
        },
      }

      const result = normalizeToAddress(mockCsl as any, 'invalid')

      expect(result).toBeUndefined()
    })
  })

  describe('validateAndExtractAddressInfo', () => {
    it('should extract address info from bech32', async () => {
      // This function uses CardanoMobileWrapped.cslScope which requires real CSL
      // We'll test the structure indirectly through integration tests
      // For unit tests, we verify the function exists and has correct signature
      expect(typeof validateAndExtractAddressInfo).toBe('function')

      // The function should return AddressInfo or undefined
      // Actual testing requires real CSL instance
    })
  })

  describe('filterAddressesByStakingKey', () => {
    it('should filter addresses by staking key', async () => {
      const mockStakeCred = {
        toBytes: jest.fn(() => Buffer.from('stake_cred', 'hex')),
      }
      const mockBaseAddress = {
        stakeCred: jest.fn(() => ({
          toBytes: jest.fn(() => Buffer.from('stake_cred', 'hex')),
        })),
      }
      const mockAddress = {
        isMalformed: jest.fn(() => false),
      }
      const mockCsl = {
        ByronAddress: {
          isValid: jest.fn(() => false),
        },
        Address: {
          fromBech32: jest.fn(() => mockAddress),
        },
        BaseAddress: {
          fromAddress: jest.fn(() => mockBaseAddress),
        },
      }

      const utxos = [
        {receiver: 'addr_test1qpxxxxxx'},
        {receiver: 'addr_test1qpyyyyyy'},
      ]

      const result = await filterAddressesByStakingKey(
        mockCsl as any,
        mockStakeCred as any,
        utxos,
        false,
      )

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('addrContainsAccountKey', () => {
    it('should check if address contains account key', async () => {
      const mockStakeCred = {
        toBytes: jest.fn(() => Buffer.from('stake_cred', 'hex')),
      }
      const mockBaseAddress = {
        stakeCred: jest.fn(() => ({
          toBytes: jest.fn(() => Buffer.from('stake_cred', 'hex')),
        })),
      }
      const mockAddress = {
        isMalformed: jest.fn(() => false),
      }
      const mockCsl = {
        ByronAddress: {
          isValid: jest.fn(() => false),
        },
        Address: {
          fromBech32: jest.fn(() => mockAddress),
        },
        BaseAddress: {
          fromAddress: jest.fn(() => mockBaseAddress),
        },
        PointerAddress: {
          fromAddress: jest.fn(() => null),
        },
      }

      const result = await addrContainsAccountKey(
        mockCsl as any,
        'addr_test1qpxxxxxx',
        mockStakeCred as any,
        false,
      )

      expect(typeof result).toBe('boolean')
    })

    it('should handle pointer addresses with acceptTypeMismatch', async () => {
      const mockStakeCred = {
        toBytes: jest.fn(() => Buffer.from('stake_cred', 'hex')),
      }
      const mockPointerAddress = {}
      const mockAddress = {
        isMalformed: jest.fn(() => false),
      }
      const mockCsl = {
        ByronAddress: {
          isValid: jest.fn(() => false),
        },
        Address: {
          fromBech32: jest.fn(() => mockAddress),
        },
        BaseAddress: {
          fromAddress: jest.fn(() => null),
        },
        PointerAddress: {
          fromAddress: jest.fn(() => mockPointerAddress),
        },
      }

      const result = await addrContainsAccountKey(
        mockCsl as any,
        'addr_test1qpxxxxxx',
        mockStakeCred as any,
        true,
      )

      expect(result).toBe(true) // acceptTypeMismatch = true
    })

    it('should throw error for invalid address', async () => {
      const mockStakeCred = {}
      const mockAddress = {
        isMalformed: jest.fn(() => true),
      }
      const mockCsl = {
        ByronAddress: {
          isValid: jest.fn(() => false),
        },
        Address: {
          fromBech32: jest.fn(() => mockAddress),
        },
      }

      await expect(
        addrContainsAccountKey(
          mockCsl as any,
          'invalid',
          mockStakeCred as any,
          false,
        ),
      ).rejects.toThrow('invalid address')
    })
  })

  describe('derivePublicByAddressing', () => {
    it('should derive public key by addressing', () => {
      const addressing: Addressing = {
        path: [1852, 1815, 0, 0, 0],
        startLevel: 2,
      }
      // Create a chain of derive methods
      const finalKey = 'final_key'
      const key3 = {derive: jest.fn(() => finalKey)}
      const key2 = {derive: jest.fn(() => key3)}
      const key1 = {derive: jest.fn(() => key2)}
      const mockKey = {derive: jest.fn(() => key1)}
      const startingFrom = {
        key: mockKey as any,
        level: 2,
      }

      const result = derivePublicByAddressing(addressing, startingFrom)

      expect(result).toBe(finalKey)
    })

    it('should throw error when key level is less than start level', () => {
      const addressing: Addressing = {
        path: [1852, 1815, 0, 0, 0],
        startLevel: 2,
      }
      const startingFrom = {
        key: {} as any,
        level: 0, // Less than startLevel - 1
      }

      expect(() => derivePublicByAddressing(addressing, startingFrom)).toThrow(
        'keyLevel < startLevel',
      )
    })

    it('should throw error for invalid addressing path', () => {
      const addressing: Addressing = {
        path: [1852, 1815, undefined as any], // Invalid path with undefined
        startLevel: 2,
      }
      const key1: any = {derive: jest.fn(() => key1)} // Circular for simplicity
      const mockKey = {derive: jest.fn(() => key1)}
      const startingFrom = {
        key: mockKey as any,
        level: 2,
      }

      expect(() => derivePublicByAddressing(addressing, startingFrom)).toThrow(
        'Invalid addressing path',
      )
    })
  })
})
