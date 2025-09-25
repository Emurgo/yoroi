import {Numbers} from '@yoroi/types'

import {parseNumberFromText} from './parseNumberFromText'

describe('parseNumberFromText', () => {
  const englishFormat: Numbers.Locale = {
    prefix: '',
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSize: 0,
    fractionGroupSeparator: '',
    suffix: '',
  }
  const italianFormat: Numbers.Locale = {
    prefix: '',
    decimalSeparator: ',',
    groupSeparator: ' ',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSize: 0,
    fractionGroupSeparator: '',
    suffix: '',
  }

  it('should handle empty input', () => {
    const result = parseNumberFromText({
      text: '',
      denomination: 6,
      format: englishFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '',
      formattedValue: '',
      numericValue: 0,
      quantity: '0',
    })
  })

  it('should handle keyboard-locale mismatch (English keyboard, Italian locale)', () => {
    const result = parseNumberFromText({
      text: '123.45',
      denomination: 6,
      format: italianFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '123,45',
      formattedValue: '123,45',
      numericValue: 123.45,
      quantity: '123450000',
    })
  })

  it('should handle keyboard-locale mismatch (Italian keyboard, English locale)', () => {
    const result = parseNumberFromText({
      text: '123,45',
      denomination: 6,
      format: englishFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '123.45',
      formattedValue: '123.45',
      numericValue: 123.45,
      quantity: '123450000',
    })
  })

  it('should handle intermediate states', () => {
    const result = parseNumberFromText({
      text: '55.',
      denomination: 6,
      format: englishFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '55.',
      formattedValue: '55', // Remove trailing decimal separator
      numericValue: 55,
      quantity: '55000000',
    })
  })

  it('should handle trailing zeros', () => {
    const result = parseNumberFromText({
      text: '55.0',
      denomination: 6,
      format: englishFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '55.0',
      formattedValue: '55.0',
      numericValue: 55,
      quantity: '55000000',
    })
  })

  it('should handle thousands separators from copy/paste', () => {
    const result = parseNumberFromText({
      text: '1,234.56',
      denomination: 6,
      format: englishFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '1234.56',
      formattedValue: '1,234.56', // BigNumber.toFormat() preserves thousands separators
      numericValue: 1234.56,
      quantity: '1234560000',
    })
  })

  it('should respect precision limits', () => {
    const result = parseNumberFromText({
      text: '123.456789',
      denomination: 6,
      format: englishFormat,
      precision: 4,
    })
    expect(result).toEqual({
      sanitizedInput: '123.4567', // Precision-limited input
      formattedValue: '123.4567', // Truncated to precision
      numericValue: 123.4567,
      quantity: '123456700',
    })
  })

  it('should handle unitless numbers (no denomination)', () => {
    const result = parseNumberFromText({
      text: '123.45',
      format: englishFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '123.45',
      formattedValue: '123.45',
      numericValue: 123.45,
      quantity: undefined,
    })
  })

  it('should handle unitless numbers with precision', () => {
    const result = parseNumberFromText({
      text: '123.456789',
      format: englishFormat,
      precision: 4,
    })
    expect(result).toEqual({
      sanitizedInput: '123.4567', // Precision-limited input
      formattedValue: '123.4567', // Truncated to precision
      numericValue: 123.4567,
      quantity: undefined,
    })
  })

  it('should handle empty input for unitless numbers', () => {
    const result = parseNumberFromText({
      text: '',
      format: englishFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '',
      formattedValue: '',
      numericValue: 0,
      quantity: undefined,
    })
  })

  it('should handle intermediate states for unitless numbers', () => {
    const result = parseNumberFromText({
      text: '55.',
      format: englishFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '55.',
      formattedValue: '55', // Remove trailing decimal separator
      numericValue: 55,
      quantity: undefined,
    })
  })

  it('should handle integer-only input (no decimal separator)', () => {
    const result = parseNumberFromText({
      text: '123',
      denomination: 6,
      format: englishFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '123',
      formattedValue: '123',
      numericValue: 123,
      quantity: '123000000',
    })
  })

  it('should handle integer-only input for unitless numbers', () => {
    const result = parseNumberFromText({
      text: '123',
      format: englishFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '123',
      formattedValue: '123',
      numericValue: 123,
      quantity: undefined,
    })
  })

  it('should throw error for invalid quantity in asQuantity', () => {
    // This test covers the error case in asQuantity function
    // We need to test the asQuantity function directly since sanitization prevents invalid input
    const {asQuantity} = require('./parseNumberFromText')
    expect(() => {
      asQuantity('invalid')
    }).toThrow('Invalid quantity')
  })

  it('should handle input starting with decimal separator', () => {
    const result = parseNumberFromText({
      text: '.45',
      denomination: 6,
      format: englishFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '0.45',
      formattedValue: '0.45',
      numericValue: 0.45,
      quantity: '450000',
    })
  })

  it('should handle input starting with decimal separator for unitless numbers', () => {
    const result = parseNumberFromText({
      text: '.45',
      format: englishFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '0.45',
      formattedValue: '0.45',
      numericValue: 0.45,
      quantity: undefined,
    })
  })

  it('should handle input starting with decimal separator (Italian locale)', () => {
    const result = parseNumberFromText({
      text: ',45',
      denomination: 6,
      format: italianFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '0,45',
      formattedValue: '0,45',
      numericValue: 0.45,
      quantity: '450000',
    })
  })

  it('should handle multiple decimal separators', () => {
    const result = parseNumberFromText({
      text: '123.45.67',
      denomination: 6,
      format: englishFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '123.4567', // Keep only first decimal separator
      formattedValue: '123.4567',
      numericValue: 123.4567,
      quantity: '123456700',
    })
  })

  it('should handle input with both decimal separators (no normalization)', () => {
    const result = parseNumberFromText({
      text: '123.45,67', // Contains both separators
      denomination: 6,
      format: englishFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '123.4567', // Only dots kept (English locale)
      formattedValue: '123.4567',
      numericValue: 123.4567,
      quantity: '123456700',
    })
  })

  it('should handle Italian locale with comma input (no normalization needed)', () => {
    const result = parseNumberFromText({
      text: '123,45', // Italian format input with Italian locale
      denomination: 6,
      format: italianFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '123,45', // No change needed
      formattedValue: '123,45',
      numericValue: 123.45,
      quantity: '123450000',
    })
  })

  it('should handle English locale with dot input (no normalization needed)', () => {
    const result = parseNumberFromText({
      text: '123.45', // English format input with English locale
      denomination: 6,
      format: englishFormat,
    })
    expect(result).toEqual({
      sanitizedInput: '123.45', // No change needed
      formattedValue: '123.45',
      numericValue: 123.45,
      quantity: '123450000',
    })
  })

  describe('without format parameter', () => {
    it('should return undefined formattedValue when format is not provided', () => {
      const result = parseNumberFromText({
        text: '123.45',
        denomination: 6,
      })
      expect(result).toEqual({
        sanitizedInput: '123.45',
        formattedValue: undefined,
        numericValue: 123.45,
        quantity: '123450000',
      })
    })

    it('should use English locale for sanitization when format is not provided', () => {
      const result = parseNumberFromText({
        text: '123,45', // Italian-style input
        denomination: 6,
      })
      expect(result).toEqual({
        sanitizedInput: '123.45', // Converted to English format
        formattedValue: undefined,
        numericValue: 123.45,
        quantity: '123450000',
      })
    })

    it('should handle empty input without format', () => {
      const result = parseNumberFromText({
        text: '',
        denomination: 6,
      })
      expect(result).toEqual({
        sanitizedInput: '',
        formattedValue: undefined,
        numericValue: 0,
        quantity: '0',
      })
    })

    it('should handle unitless numbers without format', () => {
      const result = parseNumberFromText({
        text: '123.45',
      })
      expect(result).toEqual({
        sanitizedInput: '123.45',
        formattedValue: undefined,
        numericValue: 123.45,
        quantity: undefined,
      })
    })

    it('should handle precision without format', () => {
      const result = parseNumberFromText({
        text: '123.456789',
        denomination: 6,
        precision: 4,
      })
      expect(result).toEqual({
        sanitizedInput: '123.4567', // Precision-limited input
        formattedValue: undefined,
        numericValue: 123.4567,
        quantity: '123456700',
      })
    })

    it('should handle input with both decimal separators (no normalization)', () => {
      const result = parseNumberFromText({
        text: '123.45,67', // Contains both separators
        denomination: 6,
      })
      expect(result).toEqual({
        sanitizedInput: '123.4567', // Only dots kept (English locale)
        formattedValue: undefined,
        numericValue: 123.4567,
        quantity: '123456700',
      })
    })

    it('should handle intermediate states without format', () => {
      const result = parseNumberFromText({
        text: '55.', // Intermediate state
        denomination: 6,
      })
      expect(result).toEqual({
        sanitizedInput: '55.',
        formattedValue: undefined,
        numericValue: 55,
        quantity: '55000000',
      })
    })
  })
})
