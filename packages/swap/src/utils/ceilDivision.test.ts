import {ceilDivision} from './ceilDivision'

describe('ceilDivision', () => {
  test('positive dividend and divisor', () => {
    expect(ceilDivision(10n, 3n)).toBe(4n)
    expect(ceilDivision(9n, 3n)).toBe(3n)
  })

  test('dividend or divisor is zero', () => {
    expect(ceilDivision(0n, 3n)).toBe(0n)
    expect(ceilDivision(10n, 0n)).toBe(0n)
  })

  test('dividend or divisor is negative', () => {
    expect(ceilDivision(-10n, 3n)).toBe(0n)
    expect(ceilDivision(10n, -3n)).toBe(0n)
  })

  test('both dividend and divisor are negative', () => {
    expect(ceilDivision(-10n, -3n)).toBe(0n)
  })

  test('smallest positive dividend and divisor', () => {
    expect(ceilDivision(1n, 1n)).toBe(1n)
  })

  test('divisor greater than dividend', () => {
    expect(ceilDivision(3n, 10n)).toBe(1n)
  })
})
