import BigNumber from 'bignumber.js'

import {toBigInt} from './to-bigint'

describe('toBigInt', () => {
  it('it works', () => {
    expect(toBigInt('123456789', 0)).toBe(BigInt('123456789'))
    expect(toBigInt('123456789.000000000000000001', 18)).toBe(
      123456789000000000000000001n,
    )
    expect(toBigInt('1', 18)).toBe(1_000_000_000_000_000_000n)
    expect(toBigInt(123.45, 2)).toBe(BigInt('12345'))
    expect(toBigInt(BigNumber('-123.456789'), 5)).toBe(BigInt('-12345678'))
    expect(toBigInt('', 5)).toBe(0n)
    expect(toBigInt(BigNumber(45 * 1e12), 6)).toBe(45_000_000_000_000_000_000n)
  })
})
