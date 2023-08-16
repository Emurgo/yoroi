import {z} from 'zod'
import {
  createTypeGuardFromSchema,
  isArray,
  isArrayOfType,
  isBoolean,
  isNonNullable,
  isNumber,
  isRecord,
  isString,
  parseBoolean,
  parseSafe,
  parseString,
} from './parsers'

describe('parsers', () => {
  describe('isArrayOfType', () => {
    it('returns true if array is empty', () => {
      expect(isArrayOfType([], isString)).toEqual(true)
    })

    it('returns true if array contains only elements of given type', () => {
      expect(isArrayOfType(['a', 'b', 'c'], isString)).toEqual(true)
    })

    it('returns false if array contains elements of different type', () => {
      expect(isArrayOfType(['a', 'b', 1], isString)).toEqual(false)
    })
  })

  describe('isString', () => {
    it('returns true if string', () => {
      expect(isString('hello')).toEqual(true)
    })

    it('returns false if not string', () => {
      expect(isString(123)).toEqual(false)
      expect(isString({})).toEqual(false)
      expect(isString([])).toEqual(false)
      expect(isString(null)).toEqual(false)
      expect(isString(undefined)).toEqual(false)
      expect(isString(true)).toEqual(false)
    })
  })

  describe('isRecord', () => {
    it('returns true if is an object', () => {
      expect(isRecord({})).toEqual(true)
    })

    it('returns false if is not an object or its array or its null', () => {
      expect(isRecord([])).toEqual(false)
      expect(isRecord(null)).toEqual(false)
      expect(isRecord(undefined)).toEqual(false)
      expect(isRecord(123)).toEqual(false)
      expect(isRecord('hello')).toEqual(false)
      expect(isRecord(true)).toEqual(false)
    })
  })

  describe('isNonNullable', () => {
    it('returns true if value is not null nor undefined', () => {
      expect(isNonNullable(1)).toEqual(true)
      expect(isNonNullable('hello')).toEqual(true)
      expect(isNonNullable({})).toEqual(true)
      expect(isNonNullable([])).toEqual(true)
      expect(isNonNullable(false)).toEqual(true)
      expect(isNonNullable(true)).toEqual(true)
      expect(isNonNullable(0)).toEqual(true)
      expect(isNonNullable('')).toEqual(true)
    })

    it('returns false if null or undefined', () => {
      expect(isNonNullable(null)).toEqual(false)
      expect(isNonNullable(undefined)).toEqual(false)
    })
  })

  describe('parseBoolean', () => {
    it('should return a boolean if the data is a boolean', () => {
      expect(parseBoolean('true')).toBe(true)
      expect(parseBoolean('false')).toBe(false)
    })
    it('should return undefined if the data is not a boolean', () => {
      expect(parseBoolean('abc')).toBeUndefined()
      expect(parseBoolean('123')).toBeUndefined()
    })
  })

  describe('parseString', () => {
    it('should return a string if the data is a string', () => {
      expect(parseString('"hello"')).toBe('hello')
    })
    it('should return undefined if the data is not a string', () => {
      expect(parseString('true')).toBeUndefined()
      expect(parseString('123')).toBeUndefined()
    })
  })

  describe('parseSafe', () => {
    it('should return parsed JSON if valid JSON', () => {
      expect(parseSafe('{"key": "value"}')).toEqual({key: 'value'})
    })
    it('should return undefined if invalid JSON', () => {
      expect(parseSafe('{key: value}')).toBeUndefined()
    })
  })

  describe('isBoolean', () => {
    it('should return true if the data is a boolean', () => {
      expect(isBoolean(true)).toBe(true)
      expect(isBoolean(false)).toBe(true)
    })
    it('should return false if the data is not a boolean', () => {
      expect(isBoolean('true')).toBe(false)
    })
  })

  describe('isNumber', () => {
    it('should return true if the data is a number', () => {
      expect(isNumber(123)).toBe(true)
    })
    it('should return false if the data is not a number', () => {
      expect(isNumber('123')).toBe(false)
    })
  })

  describe('createTypeGuardFromSchema', () => {
    const isPerson = createTypeGuardFromSchema(
      z.object({
        name: z.string(),
        age: z.number(),
      }),
    )

    it('should return true if the data matches the schema', () => {
      expect(isPerson({name: 'John', age: 30})).toBe(true)
    })
    it('should return false if the data does not match the schema', () => {
      expect(isPerson({name: 'John', age: '30'})).toBe(false)
    })
  })

  describe('isArray', () => {
    it('should return true if the data is an array', () => {
      expect(isArray(['a', 'b', 'c'])).toBe(true)
    })
    it('should return false if the data is not an array', () => {
      expect(isArray('hello')).toBe(false)
    })
  })
})
