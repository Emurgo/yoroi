import BigNumber from 'bignumber.js'

import {toBigInt} from './to-bigint'

describe('toBigInt', () => {
  it('should convert string to bigint with no decimals', () => {
    expect(toBigInt('123456789', 0)).toBe(123456789n)
  })

  it('should convert string to bigint with decimals', () => {
    expect(toBigInt('123.456789', 6)).toBe(123456789n)
  })

  it('should handle negative values', () => {
    expect(toBigInt('-1', 18)).toBe(-1000000000000000000n)
  })

  it('should handle absolute option', () => {
    expect(toBigInt('-1', 18, true)).toBe(1000000000000000000n)
  })

  it('should sanitize string input', () => {
    expect(toBigInt('123abc456', 0)).toBe(123456n)
  })

  it('should convert number to bigint', () => {
    expect(toBigInt(123, 0)).toBe(123n)
  })

  it('should convert BigNumber to bigint', () => {
    const bn = new BigNumber('123.456')
    expect(toBigInt(bn, 3)).toBe(123456n)
  })

  it('should handle zero', () => {
    expect(toBigInt('0', 6)).toBe(0n)
  })

  it('should handle empty string as zero', () => {
    expect(toBigInt('', 6)).toBe(0n)
  })

  it('should handle absolute with positive value', () => {
    expect(toBigInt('1', 18, true)).toBe(1000000000000000000n)
  })

  it('should handle absolute with zero', () => {
    expect(toBigInt('0', 18, true)).toBe(0n)
  })

  it('should return negative value when absolute is false', () => {
    expect(toBigInt('-5', 0, false)).toBe(-5n)
  })
})
