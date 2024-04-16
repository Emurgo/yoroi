import {z} from 'zod'
import {
  createTypeGuardFromSchema,
  isArray,
  isArrayOfType,
  isBoolean,
  isNonNullable,
  isNumber,
  isPositiveNumber,
  isRecord,
  isString,
  isArrayOfString,
  isStringOrArrayOfString,
  parseBoolean,
  parseSafe,
  parseString,
  parseNumber,
  isUrl,
  isKeyOf,
  getKeys,
  isStringLiteral,
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

  describe('isUrl', () => {
    it('returns true if string is a valid url', () => {
      expect(isUrl('https://domiain.com')).toEqual(true)
      expect(isUrl('http://domain.com')).toEqual(true)
      expect(isUrl('bitcoin://domain.com/path')).toEqual(true)
      expect(isUrl('ipfs://domain.com/path?query=string')).toEqual(true)
      expect(isUrl('https://domain.com/path?query=string#hash')).toEqual(true)
    })

    it('returns false if string is not a valid url', () => {
      expect(isUrl('hello')).toEqual(false)
      expect(isUrl('123')).toEqual(false)
      expect(isUrl({})).toEqual(false)
      expect(isUrl([])).toEqual(false)
      expect(isUrl(null)).toEqual(false)
      expect(isUrl(undefined)).toEqual(false)
      expect(isUrl(true)).toEqual(false)
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
      expect(parseString({})).toBeUndefined()
      expect(parseString({hi: 1})).toBeUndefined()
      expect(parseString(1)).toBeUndefined()
      expect(parseString(null)).toBeUndefined()
      expect(parseString(undefined)).toBeUndefined()
    })
  })

  describe('parseNumber', () => {
    it('should return a number if the parsed data is a number', () => {
      expect(parseNumber('42')).toEqual(42)
      expect(parseNumber(42)).toEqual(42)
      expect(parseNumber('3.14')).toEqual(3.14)
    })

    it('should return undefined if the parsed data is not a number', () => {
      expect(parseNumber('abc')).toBeUndefined()
      expect(parseNumber({})).toBeUndefined()
      expect(parseNumber(null)).toBeUndefined()
      expect(parseNumber(undefined)).toBeUndefined()
      expect(parseNumber(true)).toBeUndefined()
    })

    it('should return undefined for non-number strings', () => {
      expect(parseNumber('hello')).toBeUndefined()
      expect(parseNumber('true')).toBeUndefined()
      expect(parseNumber('false')).toBeUndefined()
    })

    it('should handle edge cases', () => {
      expect(parseNumber(Infinity)).toBeUndefined()
      expect(parseNumber(-Infinity)).toBeUndefined()
      expect(parseNumber(NaN)).toBeUndefined() // Depends on how you define "isNumber"
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

  describe('isPositiveNumber', () => {
    it('should return true if the data is a positive number', () => {
      expect(isPositiveNumber(1)).toBe(true)
    })

    it('should return false if the data is zero or a negative number', () => {
      expect(isPositiveNumber(0)).toBe(false)
      expect(isPositiveNumber(-1)).toBe(false)
    })

    it('should return false if the data is not a number', () => {
      expect(isPositiveNumber('1')).toBe(false)
      expect(isPositiveNumber(undefined)).toBe(false)
      expect(isPositiveNumber(null)).toBe(false)
      expect(isPositiveNumber({})).toBe(false)
      expect(isPositiveNumber([])).toBe(false)
      expect(isPositiveNumber(NaN)).toBe(false)
      expect(isPositiveNumber(Infinity)).toBe(false)
    })
  })

  describe('isArrayOfString', () => {
    it('should return true if the data is an array of strings', () => {
      expect(isArrayOfString(['a', 'b', 'c'])).toBe(true)
    })

    it('should return false if the data is not an array of strings', () => {
      expect(isArrayOfString(['a', 1, 'c'])).toBe(false)
      expect(isArrayOfString([1, 2, 3])).toBe(false)
      expect(isArrayOfString('abc')).toBe(false)
    })
  })

  describe('isStringOrArrayOfString', () => {
    it('should return true if the data is a string', () => {
      expect(isStringOrArrayOfString('hello')).toBe(true)
    })

    it('should return true if the data is an array of strings', () => {
      expect(isStringOrArrayOfString(['hello', 'world'])).toBe(true)
      expect(isStringOrArrayOfString([])).toBe(true)
    })

    it('should return false if the data is neither a string nor an array of strings', () => {
      expect(isStringOrArrayOfString(['hello', 1])).toBe(false)
      expect(isStringOrArrayOfString(123)).toBe(false)
      expect(isStringOrArrayOfString(null)).toBe(false)
      expect(isStringOrArrayOfString(undefined)).toBe(false)
      expect(isStringOrArrayOfString({})).toBe(false)
    })
  })

  describe('isKeyOf', () => {
    it('should return true if the key is in the object', () => {
      expect(isKeyOf('a', {a: 1})).toBe(true)
    })

    it('should return false if the key is not in the object', () => {
      expect(isKeyOf('b', {a: 1})).toBe(false)
      expect(isKeyOf(1, {a: 1})).toBe(false)
      expect(isKeyOf('a', {1: 1})).toBe(false)
    })
  })

  describe('getKeys', () => {
    it('should return the keys of the object', () => {
      expect(getKeys({a: 1, b: 2})).toEqual(['a', 'b'])
    })

    it('should return an empty array if the object is empty', () => {
      expect(getKeys({})).toEqual([])
    })
  })

  describe('isStringLiteral function', () => {
    const literalsArray = ['apple', 'banana', 'cherry']

    it('should return true for a value that is part of the literals array', () => {
      const value = 'banana'
      const result = isStringLiteral(literalsArray, value)
      expect(result).toBe(true)
    })

    it('should return false for a value that is not part of the literals array', () => {
      const value = 'orange'
      const result = isStringLiteral(literalsArray, value)
      expect(result).toBe(false)
    })

    it('should return false for a number value when literals array contains only strings', () => {
      const value = 123
      const result = isStringLiteral(literalsArray, value)
      expect(result).toBe(false)
    })

    it('should return false for an object value when literals array contains only strings', () => {
      const value = {fruit: 'banana'}
      const result = isStringLiteral(literalsArray, value)
      expect(result).toBe(false)
    })

    it('should return false for a boolean value when literals array contains only strings', () => {
      const value = true
      const result = isStringLiteral(literalsArray, value)
      expect(result).toBe(false)
    })

    it('should return false for null when literals array contains only strings', () => {
      const value = null
      const result = isStringLiteral(literalsArray, value)
      expect(result).toBe(false)
    })

    it('should return false for undefined when literals array contains only strings', () => {
      const value = undefined
      const result = isStringLiteral(literalsArray, value)
      expect(result).toBe(false)
    })
  })
})
