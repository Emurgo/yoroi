import BigNumber from 'bignumber.js'

import {toBigInt} from './to-bigint'

describe('toBigInt', () => {
  it.each`
    input                             | decimals | expected
    ${'123456789'}                    | ${0}     | ${BigInt('123456789')}
    ${'123456789.000000000000000001'} | ${18}    | ${BigInt('123456789000000000000000001')}
    ${'1'}                            | ${18}    | ${BigInt('1000000000000000000')}
    ${-1}                             | ${1}     | ${BigInt('-10')}
    ${123.45}                         | ${2}     | ${BigInt('12345')}
    ${new BigNumber('-123.456789')}   | ${5}     | ${BigInt('-12345678')}
    ${''}                             | ${5}     | ${BigInt('0')}
    ${new BigNumber(45 * 1e12)}       | ${6}     | ${BigInt('45000000000000000000')}
  `(
    'parses $input with $decimals decimals into $expected',
    ({input, decimals, expected}) => {
      expect(toBigInt(input, decimals)).toBe(expected)
    },
  )
})
