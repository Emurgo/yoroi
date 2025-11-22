import {isArrayOfType, isString} from './parsers'
import {
  asConcatenedString,
  asciiToHex,
  hexToAscii,
  truncateString,
} from './strings'

jest.mock('./parsers', () => ({
  isString: jest.fn(),
  isArrayOfType: jest.fn(),
}))

describe('strings utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('asConcatenedString', () => {
    it('should return string as-is when value is string', () => {
      ;(isString as unknown as jest.Mock).mockReturnValue(true)
      expect(asConcatenedString('test')).toBe('test')
    })

    it('should join array of strings', () => {
      ;(isString as unknown as jest.Mock).mockReturnValue(false)
      ;(isArrayOfType as unknown as jest.Mock).mockReturnValue(true)
      expect(asConcatenedString(['a', 'b', 'c'])).toBe('abc')
    })

    it('should return undefined for null', () => {
      ;(isString as unknown as jest.Mock).mockReturnValue(false)
      ;(isArrayOfType as unknown as jest.Mock).mockReturnValue(false)
      expect(asConcatenedString(null)).toBeUndefined()
    })

    it('should return undefined for undefined', () => {
      ;(isString as unknown as jest.Mock).mockReturnValue(false)
      ;(isArrayOfType as unknown as jest.Mock).mockReturnValue(false)
      expect(asConcatenedString(undefined)).toBeUndefined()
    })
  })

  describe('truncateString', () => {
    it('should truncate long strings', () => {
      const long = 'a'.repeat(20)
      const result = truncateString({value: long, maxLength: 10})
      expect(result.length).toBe(10)
      expect(result).toContain('...')
    })

    it('should return original string if short enough', () => {
      expect(truncateString({value: 'short', maxLength: 10})).toBe('short')
    })

    it('should use custom separator', () => {
      const result = truncateString({
        value: 'a'.repeat(20),
        maxLength: 10,
        separator: '---',
      })
      expect(result).toContain('---')
    })
  })

  describe('hexToAscii', () => {
    it('should convert hex to ascii', () => {
      expect(hexToAscii('48656c6c6f')).toBe('Hello')
    })

    it('should return empty string for invalid hex', () => {
      expect(hexToAscii('invalid')).toBe('')
      expect(hexToAscii('')).toBe('')
      expect(hexToAscii('123')).toBe('') // odd length
    })
  })

  describe('asciiToHex', () => {
    it('should convert ascii to hex', () => {
      expect(asciiToHex('Hello')).toBe('48656c6c6f')
    })

    it('should handle empty string', () => {
      expect(asciiToHex('')).toBe('')
    })
  })
})
