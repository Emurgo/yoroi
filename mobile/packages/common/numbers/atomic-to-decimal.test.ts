import {atomicToDecimal} from './atomic-to-decimal'

describe('atomicToDecimal', () => {
  it('should convert atomic value to decimal', () => {
    const result = atomicToDecimal({value: '123456789', decimals: 6})
    expect(result.toNumber()).toBe(123.456789)
  })

  it('should handle bigint input', () => {
    const result = atomicToDecimal({value: 123456789n, decimals: 6})
    expect(result.toNumber()).toBe(123.456789)
  })

  it('should extract numbers from exponential notation', () => {
    const result = atomicToDecimal({value: '1e+4', decimals: 0})
    expect(result.toNumber()).toBe(14)
  })

  it('should return zero for invalid input', () => {
    const result = atomicToDecimal({value: 'abc', decimals: 6})
    expect(result.toNumber()).toBe(0)
  })

  it('should handle zero decimals', () => {
    const result = atomicToDecimal({value: '123456789', decimals: 0})
    expect(result.toNumber()).toBe(123456789)
  })

  it('should round down decimal places', () => {
    const result = atomicToDecimal({value: '123456789', decimals: 6})
    expect(result.decimalPlaces()).toBe(6)
  })
})
