import {Numbers} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'

import {parseDecimal} from './parse-decimal'

describe('parseDecimal', () => {
  const formatUnderscore: Partial<Numbers.Locale> = {decimalSeparator: '_'}
  const formatSpace: Partial<Numbers.Locale> = {decimalSeparator: ' '}
  const formatCommaAndDot: Partial<Numbers.Locale> = {
    decimalSeparator: ',',
    groupSeparator: '.',
    fractionGroupSeparator: '.',
    groupSize: 3,
    fractionGroupSize: 3,
  }

  it.each`
    value                       | decimalPlaces | format               | expectedInput             | expectedBn                               | expectedBi
    ${''}                       | ${2}          | ${formatUnderscore}  | ${''}                     | ${new BigNumber(0)}                      | ${BigInt(0)}
    ${'123'}                    | ${2}          | ${formatUnderscore}  | ${'123'}                  | ${new BigNumber('123')}                  | ${BigInt(12300)}
    ${'123_45'}                 | ${2}          | ${formatUnderscore}  | ${'123_45'}               | ${new BigNumber('123.45')}               | ${BigInt(12345)}
    ${'_45'}                    | ${2}          | ${formatUnderscore}  | ${'_45'}                  | ${new BigNumber('0.45')}                 | ${BigInt(45)}
    ${'45_00'}                  | ${2}          | ${formatUnderscore}  | ${'45_00'}                | ${new BigNumber('45.0')}                 | ${BigInt(4500)}
    ${'45_0'}                   | ${2}          | ${formatUnderscore}  | ${'45_0'}                 | ${new BigNumber('45.0')}                 | ${BigInt(4500)}
    ${'45_'}                    | ${2}          | ${formatUnderscore}  | ${'45_'}                  | ${new BigNumber('45.0')}                 | ${BigInt(4500)}
    ${'45'}                     | ${2}          | ${formatUnderscore}  | ${'45'}                   | ${new BigNumber('45.0')}                 | ${BigInt(4500)}
    ${'12_345'}                 | ${2}          | ${formatUnderscore}  | ${'12_34'}                | ${new BigNumber('12.34')}                | ${BigInt(1234)}
    ${'0 1234'}                 | ${2}          | ${formatSpace}       | ${'0 12'}                 | ${new BigNumber('0.12')}                 | ${BigInt(12)}
    ${'a123b45c'}               | ${2}          | ${formatUnderscore}  | ${'12345'}                | ${new BigNumber('12345')}                | ${BigInt(1234500)}
    ${'_'}                      | ${2}          | ${formatUnderscore}  | ${'_'}                    | ${new BigNumber('0')}                    | ${BigInt(0)}
    ${'123_'}                   | ${2}          | ${formatUnderscore}  | ${'123_'}                 | ${new BigNumber('123')}                  | ${BigInt(12300)}
    ${'0_00000000000000000599'} | ${18}         | ${formatUnderscore}  | ${'0_000000000000000005'} | ${new BigNumber('0.000000000000000005')} | ${BigInt(5)}
    ${'1.234.567,90'}           | ${2}          | ${formatCommaAndDot} | ${'1.234.567,90'}         | ${new BigNumber('1234567.90')}           | ${BigInt(123456790)}
  `(
    'parses "$value" with decimalPlaces of "$decimalPlaces"',
    ({value, format, decimalPlaces, expectedInput, expectedBn, expectedBi}) => {
      const result = parseDecimal({value, decimalPlaces, format})
      expect(result.text).toBe(expectedInput)
      expect(result.bn.isEqualTo(expectedBn)).toBe(true)
      expect(result.bi).toBe(expectedBi)
    },
  )
})
