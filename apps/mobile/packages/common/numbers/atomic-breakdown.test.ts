import BigNumber from 'bignumber.js'

import {atomicBreakdown} from './atomic-breakdown'

describe('atomicBreakdown', () => {
  it('should split a bigint into int dec and bn', () => {
    let bigInt = BigInt(123_456_789)
    let decimalPlaces = 3
    let expected = {
      integer: '123456',
      fraction: '789',
      bn: new BigNumber('123456.789'),
      bi: bigInt,
      decimalPlaces,
      str: '123456.789',
    }
    expect(atomicBreakdown(bigInt, decimalPlaces)).toEqual(expected)

    bigInt = BigInt(987_654_321)
    decimalPlaces = 2
    expected = {
      integer: '9876543',
      fraction: '21',
      bn: new BigNumber('9876543.21'),
      bi: bigInt,
      decimalPlaces,
      str: '9876543.21',
    }
    expect(atomicBreakdown(bigInt, decimalPlaces)).toEqual(expected)

    bigInt = BigInt(1_432_116_543)
    decimalPlaces = 5
    expected = {
      integer: '14321',
      fraction: '16543',
      bn: new BigNumber('14321.16543'),
      bi: bigInt,
      decimalPlaces,
      str: '14321.16543',
    }
    expect(atomicBreakdown(bigInt, decimalPlaces)).toEqual(expected)

    bigInt = BigInt(123)
    decimalPlaces = 6
    expected = {
      integer: '0',
      fraction: '000123',
      bn: new BigNumber('0.000123'),
      bi: bigInt,
      decimalPlaces,
      str: '0.000123',
    }
    expect(atomicBreakdown(bigInt, decimalPlaces)).toEqual(expected)

    bigInt = BigInt(123)
    decimalPlaces = 3
    expected = {
      integer: '0',
      fraction: '123',
      bn: new BigNumber('0.123'),
      bi: bigInt,
      decimalPlaces,
      str: '0.123',
    }
    expect(atomicBreakdown(bigInt, decimalPlaces)).toEqual(expected)
  })

  it('should handle negative bigint', () => {
    let bigInt = BigInt(-123_456_789)
    let decimalPlaces = 3
    let expected = {
      integer: '123456',
      fraction: '789',
      bn: new BigNumber('-123456.789'),
      bi: bigInt,
      decimalPlaces,
      str: '-123456.789',
    }
    expect(atomicBreakdown(bigInt, decimalPlaces)).toEqual(expected)

    bigInt = BigInt(-987_654_321)
    decimalPlaces = 2
    expected = {
      integer: '9876543',
      fraction: '21',
      bn: new BigNumber('-9876543.21'),
      bi: bigInt,
      decimalPlaces,
      str: '-9876543.21',
    }
    expect(atomicBreakdown(bigInt, decimalPlaces)).toEqual(expected)

    bigInt = BigInt(-1_000)
    decimalPlaces = 0
    expected = {
      integer: '1000',
      fraction: '',
      bn: new BigNumber('-1000'),
      bi: bigInt,
      decimalPlaces,
      str: '-1000',
    }
    expect(atomicBreakdown(bigInt, decimalPlaces)).toEqual(expected)
  })
})
