import {atomicFormatter} from './atomic-formatter'

describe('atomicFormatter', () => {
  // NOTE: decimal and thousands separators are locale-dependent
  it.each`
    value                 | decimalPlaces | expected
    ${BigInt(1234567890)} | ${2}          | ${'12,345,678.90'}
    ${BigInt(189)}        | ${6}          | ${'0.000189'}
    ${BigInt(1000000)}    | ${6}          | ${'1.000000'}
    ${BigInt(1000000)}    | ${0}          | ${'1,000,000'}
  `(
    'formats value $value with $decimalPlaces decimal places to $expected',
    ({value, decimalPlaces, expected}) => {
      const formattedValue = atomicFormatter({value, decimalPlaces})
      expect(formattedValue).toBe(expected)
    },
  )
})
