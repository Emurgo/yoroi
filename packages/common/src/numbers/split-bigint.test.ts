import BigNumber from 'bignumber.js'
import {splitBigInt} from './split-bigint'

describe('splitBigInt', () => {
  it('should split a bigint into int dec and bn', () => {
    let bigInt = BigInt(123_456_789)
    let decimalPlaces = 3
    let expected = {
      int: BigInt(123_456),
      dec: BigInt(789),
      bn: new BigNumber('123456.789'),
    }
    expect(splitBigInt(bigInt, decimalPlaces)).toEqual(expected)

    bigInt = BigInt(987_654_321)
    decimalPlaces = 2
    expected = {
      int: BigInt(9_876_543),
      dec: BigInt(21),
      bn: new BigNumber('9876543.21'),
    }
    expect(splitBigInt(bigInt, decimalPlaces)).toEqual(expected)

    bigInt = BigInt(1_432_116_543)
    decimalPlaces = 5
    expected = {
      int: BigInt(14_321),
      dec: BigInt(16_543),
      bn: new BigNumber('14321.16543'),
    }
    expect(splitBigInt(bigInt, decimalPlaces)).toEqual(expected)
  })
})
