import {hasEntryValue, hasValue} from './predicates'

describe('predicates', () => {
  describe('hasValue', () => {
    it('should return true for non-null values', () => {
      expect(hasValue(1)).toBe(true)
      expect(hasValue('')).toBe(true)
      expect(hasValue(0)).toBe(true)
      expect(hasValue(false)).toBe(true)
    })

    it('should return false for null or undefined', () => {
      expect(hasValue(null)).toBe(false)
      expect(hasValue(undefined)).toBe(false)
    })
  })

  describe('hasEntryValue', () => {
    it('should return true when entry value is not null', () => {
      expect(hasEntryValue(['key', 'value'])).toBe(true)
      expect(hasEntryValue(['key', 0])).toBe(true)
      expect(hasEntryValue(['key', false])).toBe(true)
    })

    it('should return false when entry value is null or undefined', () => {
      expect(hasEntryValue(['key', null])).toBe(false)
      expect(hasEntryValue(['key', undefined])).toBe(false)
    })
  })
})
