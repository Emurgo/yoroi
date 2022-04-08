import {checkISO8601Date, checkNonNegativeInt} from './facade'

describe('checkNonNegativeInt', () => {
  it('can validate positive integers', () => {
    expect(checkNonNegativeInt('0')).toBe(true)
    expect(checkNonNegativeInt('1')).toBe(true)
    expect(checkNonNegativeInt('9')).toBe(true)
    expect(checkNonNegativeInt('10')).toBe(true)
    expect(checkNonNegativeInt('1234567890')).toBe(true)
  })

  it('does not validate leading zeros', () => {
    expect(checkNonNegativeInt('00')).toBe(false)
    expect(checkNonNegativeInt('01')).toBe(false)
    expect(checkNonNegativeInt('09')).toBe(false)
  })

  it('does not validate negative', () => {
    expect(checkNonNegativeInt('-1')).toBe(false)
  })

  it('does not validate float', () => {
    expect(checkNonNegativeInt('1.27')).toBe(false)
  })

  it('does not validate empty', () => {
    expect(checkNonNegativeInt('')).toBe(false)
  })
})

describe('checkISO8601Date', () => {
  it('does validate', () => {
    expect(checkISO8601Date('2018-11-07T17:10:21.774Z')).toBe(true)
    expect(checkISO8601Date('2018-11-07T17:10:21.000Z')).toBe(true)
  })

  it('does not validate different format', () => {
    expect(checkISO8601Date('2018-11-07T17:10:21Z')).toBe(false)
  })

  it('does not validate bad dates', () => {
    expect(checkISO8601Date('2018-13-07T00:00:00.000Z')).toBe(false)
    expect(checkISO8601Date('2018-00-00T00:00:00.000Z')).toBe(false)
    expect(checkISO8601Date('2018-01-32T00:00:00.000Z')).toBe(false)
    expect(checkISO8601Date('2018-01-01T25:00:00.000Z')).toBe(false)
    expect(checkISO8601Date('2018-01-01T00:61:00.000Z')).toBe(false)
    expect(checkISO8601Date('2018-01-01T00:00:61.000Z')).toBe(false)
  })
})
