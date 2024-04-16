import {hasEntryValue, hasValue} from './predicates'

describe('hasValue', () => {
  it('should return true for non-empty values', () => {
    expect(hasValue(0)).toBe(true)
    expect(hasValue('')).toBe(true)
    expect(hasValue(false)).toBe(true)
    expect(hasValue([])).toBe(true)
    expect(hasValue({})).toBe(true)
  })

  it('should return false for null or undefined values', () => {
    expect(hasValue(null)).toBe(false)
    expect(hasValue(undefined)).toBe(false)
  })
})

describe('hasEntryValue', () => {
  it('should return true for entries with non-empty values', () => {
    expect(hasEntryValue(['key', 0])).toBe(true)
    expect(hasEntryValue(['key', ''])).toBe(true)
    expect(hasEntryValue(['key', false])).toBe(true)
    expect(hasEntryValue(['key', []])).toBe(true)
    expect(hasEntryValue(['key', {}])).toBe(true)
  })

  it('should return false for entries with null or undefined values', () => {
    expect(hasEntryValue(['key', null])).toBe(false)
    expect(hasEntryValue(['key', undefined])).toBe(false)
  })
})
