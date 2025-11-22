import {
  isValidBlockHeight,
  isValidHex64,
  isValidHexKey,
  isValidMetadataLabel,
  isValidMnemonic,
  validateBlockHash,
  validateNamespacedDomain,
  validateScheme,
  validateTransactionHash,
} from './validators'

describe('validators', () => {
  describe('isValidHex64', () => {
    it('should return true for valid 64-character hex string', () => {
      expect(
        isValidHex64(
          '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        ),
      ).toBe(true)
    })

    it('should return false for hex string with wrong length', () => {
      expect(isValidHex64('abc')).toBe(false)
      expect(
        isValidHex64(
          '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde',
        ),
      ).toBe(false)
    })

    it('should return false for non-hex characters', () => {
      expect(
        isValidHex64(
          '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdefg',
        ),
      ).toBe(false)
    })

    it('should accept uppercase hex characters', () => {
      expect(
        isValidHex64(
          '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF',
        ),
      ).toBe(true)
    })
  })

  describe('isValidBlockHeight', () => {
    it('should return true for valid non-negative integer', () => {
      expect(isValidBlockHeight('0')).toBe(true)
      expect(isValidBlockHeight('100')).toBe(true)
      expect(isValidBlockHeight('999999')).toBe(true)
    })

    it('should return false for negative numbers', () => {
      expect(isValidBlockHeight('-1')).toBe(false)
    })

    it('should return false for non-numeric strings', () => {
      expect(isValidBlockHeight('abc')).toBe(false)
      expect(isValidBlockHeight('12.5')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isValidBlockHeight('')).toBe(false)
    })
  })

  describe('isValidMetadataLabel', () => {
    it('should return true for numeric strings', () => {
      expect(isValidMetadataLabel('0')).toBe(true)
      expect(isValidMetadataLabel('123')).toBe(true)
      expect(isValidMetadataLabel('999')).toBe(true)
    })

    it('should return false for non-numeric strings', () => {
      expect(isValidMetadataLabel('abc')).toBe(false)
      expect(isValidMetadataLabel('12.5')).toBe(false)
      expect(isValidMetadataLabel('')).toBe(false)
    })
  })

  describe('validateScheme', () => {
    it('should return true for valid schemes', () => {
      expect(validateScheme('cardano')).toBe(true)
      expect(validateScheme('https')).toBe(true)
      expect(validateScheme('my-scheme')).toBe(true)
      expect(validateScheme('my+scheme')).toBe(true)
      expect(validateScheme('my.scheme')).toBe(true)
      expect(validateScheme('a1')).toBe(true)
    })

    it('should return false for schemes starting with non-letter', () => {
      expect(validateScheme('1scheme')).toBe(false)
      expect(validateScheme('-scheme')).toBe(false)
      expect(validateScheme('.scheme')).toBe(false)
    })

    it('should return false for schemes with invalid characters', () => {
      expect(validateScheme('my scheme')).toBe(false)
      expect(validateScheme('my@scheme')).toBe(false)
      expect(validateScheme('my_scheme')).toBe(false)
    })
  })

  describe('validateNamespacedDomain', () => {
    it('should return true for domains with dot', () => {
      expect(validateNamespacedDomain('example.com')).toBe(true)
      expect(validateNamespacedDomain('sub.example.com')).toBe(true)
      expect(validateNamespacedDomain('a.b')).toBe(true)
    })

    it('should return false for domains without dot', () => {
      expect(validateNamespacedDomain('example')).toBe(false)
      expect(validateNamespacedDomain('')).toBe(false)
    })
  })

  describe('validateTransactionHash', () => {
    it('should return true for "self"', () => {
      expect(validateTransactionHash('self')).toBe(true)
    })

    it('should return true for valid 64-character hex', () => {
      expect(
        validateTransactionHash(
          '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        ),
      ).toBe(true)
    })

    it('should return false for invalid hex', () => {
      expect(validateTransactionHash('invalid')).toBe(false)
      expect(validateTransactionHash('abc')).toBe(false)
    })
  })

  describe('validateBlockHash', () => {
    it('should return true for valid 64-character hex', () => {
      expect(
        validateBlockHash(
          '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        ),
      ).toBe(true)
    })

    it('should return false for invalid hex', () => {
      expect(validateBlockHash('invalid')).toBe(false)
      expect(validateBlockHash('abc')).toBe(false)
      expect(validateBlockHash('self')).toBe(false)
    })
  })

  describe('isValidMnemonic', () => {
    it('should return true for valid 12-word mnemonic', () => {
      const mnemonic =
        'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12'
      expect(isValidMnemonic(mnemonic)).toBe(true)
    })

    it('should return true for valid 15-word mnemonic', () => {
      const mnemonic =
        'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12 word13 word14 word15'
      expect(isValidMnemonic(mnemonic)).toBe(true)
    })

    it('should return true for valid 24-word mnemonic', () => {
      const mnemonic = Array.from({length: 24}, (_, i) => `word${i + 1}`).join(
        ' ',
      )
      expect(isValidMnemonic(mnemonic)).toBe(true)
    })

    it('should return false for invalid word counts', () => {
      expect(isValidMnemonic('word1 word2')).toBe(false)
      expect(
        isValidMnemonic(
          'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11',
        ),
      ).toBe(false)
      expect(isValidMnemonic('')).toBe(false)
    })

    it('should handle extra whitespace', () => {
      const mnemonic =
        '  word1   word2   word3   word4   word5   word6   word7   word8   word9   word10   word11   word12  '
      expect(isValidMnemonic(mnemonic)).toBe(true)
    })

    it('should return false if validation throws', () => {
      // This tests the catch block
      const invalidMnemonic = null as any
      expect(isValidMnemonic(invalidMnemonic)).toBe(false)
    })
  })

  describe('isValidHexKey', () => {
    it('should return true for valid hex string', () => {
      expect(isValidHexKey('abc123')).toBe(true)
      expect(isValidHexKey('ABCDEF')).toBe(true)
      expect(isValidHexKey('0123456789abcdef')).toBe(true)
    })

    it('should return false for non-hex characters', () => {
      expect(isValidHexKey('abcg')).toBe(false)
      expect(isValidHexKey('abc@123')).toBe(false)
    })

    it('should validate length when expectedLength is provided', () => {
      expect(isValidHexKey('abcd', 2)).toBe(true) // 4 hex chars = 2 bytes
      expect(isValidHexKey('abc', 2)).toBe(false) // 3 hex chars != 2 bytes
      expect(isValidHexKey('abcdef', 3)).toBe(true) // 6 hex chars = 3 bytes
    })

    it('should return false for empty string even with expectedLength=0', () => {
      // Empty string fails hex regex check before length check
      expect(isValidHexKey('', 0)).toBe(false)
      expect(isValidHexKey('', 1)).toBe(false)
    })

    it('should return false for empty string when no expectedLength', () => {
      expect(isValidHexKey('')).toBe(false)
    })
  })
})
