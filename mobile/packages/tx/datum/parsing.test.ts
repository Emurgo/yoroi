import {datumFromInfo, getDatumHash} from './parsing'
import type {Datum, DatumInfo} from './types'

describe('datum parsing', () => {
  describe('datumFromInfo', () => {
    it('should create inline datum from info', () => {
      const info: DatumInfo = {
        type: 'inline',
        hash: 'hash123',
        data: 'data456',
      }
      const result = datumFromInfo(info)

      expect(result).toEqual({
        type: 'inline',
        data: 'data456',
      })
    })

    it('should create embedded datum from info', () => {
      const info: DatumInfo = {
        type: 'embedded',
        hash: 'hash123',
        data: 'data456',
      }
      const result = datumFromInfo(info)

      expect(result).toEqual({
        type: 'embedded',
        data: 'data456',
      })
    })

    it('should create hash datum from info', () => {
      const info: DatumInfo = {
        type: 'hash',
        hash: 'hash123',
      }
      const result = datumFromInfo(info)

      expect(result).toEqual({
        type: 'hash',
        hash: 'hash123',
      })
    })
  })

  describe('convertLegacyDatum', () => {
    it('should convert legacy datum with data to inline', () => {
      const {convertLegacyDatum} = require('./parsing')
      const legacy = {data: 'data123'}
      const result = convertLegacyDatum(legacy)

      expect(result).toEqual({
        type: 'inline',
        data: 'data123',
      })
    })

    it('should convert legacy datum with hash to hash datum', () => {
      const {convertLegacyDatum} = require('./parsing')
      const legacy = {hash: 'hash123'}
      const result = convertLegacyDatum(legacy)

      expect(result).toEqual({
        type: 'hash',
        hash: 'hash123',
      })
    })

    it('should return null when legacy datum has neither data nor hash', () => {
      const {convertLegacyDatum} = require('./parsing')
      const legacy = {}
      const result = convertLegacyDatum(legacy)

      expect(result).toBeNull()
    })
  })

  describe('getDatumHash', () => {
    it('should return hash directly for hash datum', () => {
      const datum: Datum = {
        type: 'hash',
        hash: 'hash123',
      }
      // Mock CSL
      const mockCsl = {
        PlutusData: {
          fromHex: jest.fn(),
        },
        hashPlutusData: jest.fn(() => ({
          toHex: () => 'computed_hash',
        })),
      }

      const result = getDatumHash(mockCsl as any, datum)
      expect(result).toBe('hash123')
    })

    it('should compute hash for inline datum', () => {
      const datum: Datum = {
        type: 'inline',
        data: 'data123',
      }
      const mockPlutusData = {
        toHex: () => 'data123',
      }
      const mockCsl = {
        PlutusData: {
          fromHex: jest.fn(() => mockPlutusData),
        },
        hashPlutusData: jest.fn(() => ({
          toHex: () => 'computed_hash',
        })),
      }

      const result = getDatumHash(mockCsl as any, datum)
      expect(result).toBe('computed_hash')
      expect(mockCsl.PlutusData.fromHex).toHaveBeenCalledWith('data123')
      expect(mockCsl.hashPlutusData).toHaveBeenCalledWith(mockPlutusData)
    })

    it('should compute hash for embedded datum', () => {
      const datum: Datum = {
        type: 'embedded',
        data: 'data123',
      }
      const mockPlutusData = {
        toHex: () => 'data123',
      }
      const mockCsl = {
        PlutusData: {
          fromHex: jest.fn(() => mockPlutusData),
        },
        hashPlutusData: jest.fn(() => ({
          toHex: () => 'computed_hash',
        })),
      }

      const result = getDatumHash(mockCsl as any, datum)
      expect(result).toBe('computed_hash')
    })

    it('should throw error for invalid datum type', () => {
      const datum = {type: 'invalid'} as any
      const mockCsl = {} as any

      expect(() => getDatumHash(mockCsl, datum)).toThrow('Invalid datum type')
    })
  })
})
