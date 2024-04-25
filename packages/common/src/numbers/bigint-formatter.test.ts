import {bigintFormatter} from './bigint-formatter'

describe('bigintFormatter', () => {
  // NOTE: decimal and thousands separators are locale-dependent
  it('it works', () => {
    let value = BigInt(1_234_567_890)
    let decimalPlaces = 2
    let formattedValue = bigintFormatter({value, decimalPlaces})
    expect(formattedValue).toBe('12,345,678.90')

    value = BigInt(189)
    decimalPlaces = 6
    formattedValue = bigintFormatter({value, decimalPlaces})
    expect(formattedValue).toBe('0.000189')

    value = BigInt(1_000_000)
    formattedValue = bigintFormatter({value, decimalPlaces})
    expect(formattedValue).toBe('1.000000')

    value = BigInt(1_000_000)
    decimalPlaces = 0
    formattedValue = bigintFormatter({value, decimalPlaces})
    expect(formattedValue).toBe('1,000,000')
  })
})
