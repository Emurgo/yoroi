import BigNumber from 'bignumber.js'

import {toBigInt} from './to-bigint'

describe('toBigInt', () => {
  it.each`
    input                             | decimals     | abs          | expected
    ${'123456789'}                    | ${0}         | ${undefined} | ${BigInt('123456789')}
    ${'123456789.000000000000000001'} | ${18}        | ${undefined} | ${BigInt('123456789000000000000000001')}
    ${'AB1CD'}                        | ${18}        | ${undefined} | ${BigInt('1000000000000000000')}
    ${-1}                             | ${1}         | ${undefined} | ${BigInt('-10')}
    ${123.45}                         | ${2}         | ${undefined} | ${BigInt('12345')}
    ${new BigNumber('-123.456789')}   | ${5}         | ${undefined} | ${BigInt('-12345678')}
    ${''}                             | ${5}         | ${undefined} | ${BigInt('0')}
    ${new BigNumber(45 * 1e12)}       | ${6}         | ${undefined} | ${BigInt('45000000000000000000')}
    ${new BigNumber(-1)}              | ${undefined} | ${undefined} | ${BigInt('-1')}
    ${new BigNumber(-1)}              | ${undefined} | ${true}      | ${BigInt('1')}
    ${new BigNumber(1)}               | ${undefined} | ${true}      | ${BigInt('1')}
  `(
    'parses $input with $decimals decimals into $expected',
    ({input, decimals, abs, expected}) => {
      expect(toBigInt(input, decimals, abs)).toBe(expected)
    },
  )
})
