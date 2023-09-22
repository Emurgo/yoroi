import {asQuantity} from './asQuantity'
import BigNumber from 'bignumber.js'

describe('asQuantity', () => {
  it('should convert a BigNumber to Balance.Quantity', () => {
    const input = new BigNumber('1000')
    const result = asQuantity(input)
    expect(result).toBe('1000')
  })

  it('should convert a number to Balance.Quantity', () => {
    const input = 500
    const result = asQuantity(input)
    expect(result).toBe('500')
  })

  it('should convert a string to Balance.Quantity', () => {
    const input = '750'
    const result = asQuantity(input)
    expect(result).toBe('750')
  })

  it('should throw an error for invalid input', () => {
    // Test with invalid input (NaN)
    const input = NaN
    expect(() => asQuantity(input)).toThrow('Invalid quantity')
  })

  it('should convert a negative number to Balance.Quantity', () => {
    const input = -123.456
    const result = asQuantity(input)
    expect(result).toBe('-123.456')
  })

  it('should convert a string with leading and trailing spaces to Balance.Quantity', () => {
    const input = '  789.123  '
    const result = asQuantity(input)
    expect(result).toBe('789.123')
  })

  it('should handle scientific notation', () => {
    const input = '1.23e+3'
    const result = asQuantity(input)
    expect(result).toBe('1230')
  })
})
