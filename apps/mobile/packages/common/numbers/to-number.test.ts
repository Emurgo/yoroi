import {toNumber} from './to-number'

describe('toNumber', () => {
  it.each`
    input        | expected
    ${'123'}     | ${123}
    ${'12.34'}   | ${12.34}
    ${'abc'}     | ${0}
    ${null}      | ${0}
    ${undefined} | ${0}
    ${''}        | ${0}
  `('should convert $input to $expected', ({input, expected}) => {
    expect(toNumber(input)).toBe(expected)
  })
})
