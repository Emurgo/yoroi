import type {Datum} from './types'
import {
  validateDatum,
  validateDatumHash,
  validatePlutusData,
} from './validation'

describe('datum validation', () => {
  describe('validateDatum', () => {
    it('should validate hash datum with valid hash', () => {
      const datum: Datum = {
        type: 'hash',
        hash: 'a'.repeat(64),
      }
      const result = validateDatum(datum)

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject hash datum with invalid hash format', () => {
      const datum: Datum = {
        type: 'hash',
        hash: 'invalid',
      }
      const result = validateDatum(datum)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Datum hash must be 64 hex characters')
    })

    it('should reject hash datum with missing hash', () => {
      const datum = {type: 'hash'} as any
      const result = validateDatum(datum)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid datum hash')
    })

    it('should validate inline datum with valid hex data', () => {
      const datum: Datum = {
        type: 'inline',
        data: 'abcdef123456',
      }
      const result = validateDatum(datum)

      expect(result.valid).toBe(true)
    })

    it('should reject inline datum with invalid hex data', () => {
      const datum: Datum = {
        type: 'inline',
        data: 'invalid-hex!',
      }
      const result = validateDatum(datum)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Datum data must be hex string')
    })

    it('should reject inline datum with missing data', () => {
      const datum = {type: 'inline'} as any
      const result = validateDatum(datum)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid datum data')
    })

    it('should validate embedded datum', () => {
      const datum: Datum = {
        type: 'embedded',
        data: 'abcdef123456',
      }
      const result = validateDatum(datum)

      expect(result.valid).toBe(true)
    })

    it('should reject unknown datum type', () => {
      const datum = {type: 'unknown'} as any
      const result = validateDatum(datum)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Unknown datum type')
    })
  })

  describe('validatePlutusData', () => {
    it('should validate hash datum (data not available)', () => {
      const datum: Datum = {
        type: 'hash',
        hash: 'a'.repeat(64),
      }
      const mockCsl = {} as any
      const result = validatePlutusData(mockCsl, datum)

      expect(result.valid).toBe(true)
    })

    it('should validate inline datum with valid PlutusData', () => {
      const datum: Datum = {
        type: 'inline',
        data: 'd8799f',
      }
      const mockPlutusData = {}
      const mockCsl = {
        PlutusData: {
          fromHex: jest.fn(() => mockPlutusData),
        },
      }
      const result = validatePlutusData(mockCsl as any, datum)

      expect(result.valid).toBe(true)
      expect(mockCsl.PlutusData.fromHex).toHaveBeenCalledWith('d8799f')
    })

    it('should reject inline datum with invalid hex format', () => {
      const datum: Datum = {
        type: 'inline',
        data: 'invalid-hex!',
      }
      const mockCsl = {
        PlutusData: {
          fromHex: jest.fn(() => {
            throw new Error('Invalid hex')
          }),
        },
      }
      const result = validatePlutusData(mockCsl as any, datum)

      expect(result.valid).toBe(false)
      // Format validation happens first
      expect(result.error).toBe('Datum data must be hex string')
    })

    it('should reject when PlutusData.fromHex returns null', () => {
      const datum: Datum = {
        type: 'inline',
        data: 'abcdef123456', // Valid hex format but invalid PlutusData
      }
      const mockCsl = {
        PlutusData: {
          fromHex: jest.fn(() => null),
        },
      }
      const result = validatePlutusData(mockCsl as any, datum)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Failed to parse PlutusData')
    })

    it('should first validate datum format', () => {
      const datum = {type: 'hash'} as any
      const mockCsl = {} as any
      const result = validatePlutusData(mockCsl, datum)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid datum hash')
    })
  })

  describe('validateDatumHash', () => {
    it('should validate hash datum (cannot validate)', () => {
      const datum: Datum = {
        type: 'hash',
        hash: 'a'.repeat(64),
      }
      const mockCsl = {} as any
      const result = validateDatumHash(mockCsl, datum)

      expect(result.valid).toBe(true)
    })

    it('should validate inline datum hash', () => {
      const datum: Datum = {
        type: 'inline',
        data: 'data123',
      }
      const mockPlutusData = {}
      const mockCsl = {
        PlutusData: {
          fromHex: jest.fn(() => mockPlutusData),
        },
        hashPlutusData: jest.fn(() => ({
          toHex: () => 'hash123',
        })),
      }
      const result = validateDatumHash(mockCsl as any, datum)

      expect(result.valid).toBe(true)
    })

    it('should reject when hash calculation fails', () => {
      const datum: Datum = {
        type: 'inline',
        data: 'invalid',
      }
      const mockCsl = {
        PlutusData: {
          fromHex: jest.fn(() => {
            throw new Error('Invalid data')
          }),
        },
      }
      const result = validateDatumHash(mockCsl as any, datum)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid data')
    })
  })
})
