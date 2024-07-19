import {atomicToDecimal} from './atomic-to-decimal'
import BigNumber from 'bignumber.js'

describe('atomicToDecimal', () => {
  it.each`
    value            | decimals | expectedBn
    ${''}            | ${20}    | ${new BigNumber(0)}
    ${'0'}           | ${20}    | ${new BigNumber(0)}
    ${'-'}           | ${20}    | ${new BigNumber(0)}
    ${'12345'}       | ${2}     | ${new BigNumber('123.45')}
    ${'100'}         | ${2}     | ${new BigNumber('1')}
    ${'-100'}        | ${2}     | ${new BigNumber('1')}
    ${'100'}         | ${3}     | ${new BigNumber('0.1')}
    ${'1000'}        | ${3}     | ${new BigNumber('1')}
    ${'999999999'}   | ${9}     | ${new BigNumber('0.999999999')}
    ${'1.23e+4'}     | ${2}     | ${new BigNumber('12.34')}
    ${'abcd123efg'}  | ${2}     | ${new BigNumber('1.23')}
    ${'1-2-3-4-5-6'} | ${8}     | ${new BigNumber('0.00123456')}
    ${1234}          | ${2}     | ${new BigNumber('12.34')}
    ${1234n}         | ${2}     | ${new BigNumber('12.34')}
  `(
    'converts "$value" with $decimals decimals correctly',
    ({value, decimals, expectedBn}) => {
      const result = atomicToDecimal({value, decimals})
      expect(result.isEqualTo(expectedBn)).toBe(true)
    },
  )
})
