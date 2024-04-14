import {Numbers} from '@yoroi/types'

import {asAtomicValue} from './as-atomic-value'

describe('asQuantity', () => {
  it.each`
    input             | expected
    ${BigInt('1000')} | ${'1000'}
    ${'1000'}         | ${'1000'}
    ${1000}           | ${'1000'}
    ${-1000}          | ${'-1000'}
    ${1e3}            | ${'1000'}
    ${1000n}          | ${'1000'}
    ${1000e-3}        | ${'1'}
    ${false}          | ${'0'}
    ${true}           | ${'1'}
  `(
    'should convert accepted types to Portfolio.Quantity',
    ({input, expected}) => {
      expect(asAtomicValue(input)).toBe(expected)
    },
  )

  it.each`
    input
    ${NaN}
    ${-1.1}
    ${1.1}
    ${Infinity}
    ${-Infinity}
  `('should throw an error for invalid input %s', ({input}) => {
    expect(() => asAtomicValue(input)).toThrow(
      Numbers.Errors.InvalidAtomicValue,
    )
  })
})
