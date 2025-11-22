import {hex, isHex, stringToHex} from './hex'

describe('hex utilities', () => {
  describe('hex', () => {
    it('should create hex object from valid hex string', () => {
      const h = hex('48656c6c6f')
      expect(h.value).toBe('48656c6c6f')
      expect(h.utf8).toBe('Hello')
      expect(h.bytes).toBeInstanceOf(Uint8Array)
    })

    it('should throw error for invalid hex string', () => {
      expect(() => hex('invalid')).toThrow('Invalid hex string')
    })

    it('should convert value to lowercase', () => {
      const h = hex('ABCDEF')
      expect(h.value).toBe('abcdef')
    })

    it('should compare hex values', () => {
      const h1 = hex('abcd')
      const h2 = hex('abcd')
      const h3 = hex('efgh')
      expect(h1.equals(h2)).toBe(true)
      expect(h1.equals(h3)).toBe(false)
    })
  })

  describe('hex.isHexString', () => {
    it('should validate hex strings', () => {
      expect(hex.isHexString('abcd1234')).toBe(true)
      expect(hex.isHexString('ABCDEF')).toBe(true)
      expect(hex.isHexString('invalid')).toBe(false)
      expect(hex.isHexString('')).toBe(true)
    })
  })

  describe('hex.fromUtf8', () => {
    it('should create hex from utf8 string', () => {
      const h = hex.fromUtf8('Hello')
      expect(h.value).toBe('48656c6c6f')
    })
  })

  describe('hex.fromBytes', () => {
    it('should create hex from bytes', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111])
      const h = hex.fromBytes(bytes)
      expect(h.value).toBe('48656c6c6f')
    })
  })

  describe('isHex', () => {
    it('should check if string is hex', () => {
      expect(isHex('abcd1234')).toBe(true)
      expect(isHex('ABCDEF')).toBe(true)
      expect(isHex('invalid')).toBe(false)
      expect(isHex('')).toBe(true)
    })
  })

  describe('stringToHex', () => {
    it('should convert string to hex', () => {
      expect(stringToHex('Hello')).toBe('48656c6c6f')
    })

    it('should handle empty string', () => {
      expect(stringToHex('')).toBe('')
    })
  })
})
