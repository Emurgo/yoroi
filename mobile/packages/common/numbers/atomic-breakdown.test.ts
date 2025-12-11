import {atomicBreakdown} from './atomic-breakdown'

describe('atomicBreakdown', () => {
  it('should break down bigint with decimals', () => {
    const result = atomicBreakdown(123456789n, 6)
    expect(result.integer).toBe('123')
    expect(result.fraction).toBe('456789')
    expect(result.str).toBe('123.456789')
    expect(result.bi).toBe(123456789n)
  })

  it('should handle zero decimals', () => {
    const result = atomicBreakdown(123456789n, 0)
    expect(result.integer).toBe('123456789')
    expect(result.fraction).toBe('')
    expect(result.str).toBe('123456789')
  })

  it('should handle negative values', () => {
    const result = atomicBreakdown(-123456789n, 6)
    expect(result.integer).toBe('123')
    expect(result.fraction).toBe('456789')
    expect(result.str).toBe('-123.456789')
  })

  it('should pad fraction with zeros', () => {
    const result = atomicBreakdown(123n, 6)
    expect(result.fraction).toBe('000123')
  })

  it('should be frozen', () => {
    const result = atomicBreakdown(123456789n, 6)
    expect(Object.isFrozen(result)).toBe(true)
  })
})
