import {Numbers} from '@yoroi/types'

import {atomicFormatter} from './atomic-formatter'

describe('atomicFormatter', () => {
  it('should format bigint with decimals', () => {
    const result = atomicFormatter({
      value: 123456789000000000000000001n,
      decimalPlaces: 18,
    })
    expect(result).toBe('123,456,789.000000000000000001')
  })

  it('should format bigint with zero decimals', () => {
    const result = atomicFormatter({
      value: 123456789n,
      decimalPlaces: 0,
    })
    expect(result).toBe('123,456,789')
  })

  it('should format with custom locale format', () => {
    const format: Numbers.Locale = {
      decimalSeparator: ',',
      groupSeparator: ' ',
      groupSize: 3,
      secondaryGroupSize: 0,
      fractionGroupSize: 0,
      fractionGroupSeparator: '',
      prefix: '',
      suffix: '',
    }

    const result = atomicFormatter({
      value: 123456789n,
      decimalPlaces: 6,
      format,
    })
    expect(result).toContain(',')
  })

  it('should round down decimal places', () => {
    const result = atomicFormatter({
      value: 12345n,
      decimalPlaces: 2,
    })
    expect(result).toBe('123.45')
  })
})
