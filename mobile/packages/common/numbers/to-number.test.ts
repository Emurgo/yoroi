import {toNumber} from './to-number'

describe('toNumber', () => {
  it('should convert string numbers to number', () => {
    expect(toNumber('123')).toBe(123)
    expect(toNumber('123.45')).toBe(123.45)
  })

  it('should convert numbers to number', () => {
    expect(toNumber(123)).toBe(123)
    expect(toNumber(123.45)).toBe(123.45)
  })

  it('should return 0 for NaN values', () => {
    expect(toNumber('invalid')).toBe(0)
    expect(toNumber(NaN)).toBe(0)
    expect(toNumber(undefined)).toBe(0)
  })

  it('should handle empty string', () => {
    expect(toNumber('')).toBe(0)
  })
})
