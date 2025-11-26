import {z} from 'zod'

import {
  createTypeGuardFromSchema,
  getKeys,
  isArray,
  isArrayOfString,
  isArrayOfType,
  isBoolean,
  isKeyOf,
  isNonNullable,
  isNumber,
  isPositiveNumber,
  isRecord,
  isString,
  isStringLiteral,
  isStringOrArrayOfString,
  isUrl,
  parseBoolean,
  parseNumber,
  parseSafe,
  parseString,
} from './parsers'

describe('parsers', () => {
  describe('parseSafe', () => {
    it('should parse valid JSON', () => {
      expect(parseSafe('{"a": 1}')).toEqual({a: 1})
    })

    it('should return undefined for invalid JSON', () => {
      expect(parseSafe('invalid')).toBeUndefined()
    })
  })

  describe('parseBoolean', () => {
    it('should parse boolean from JSON', () => {
      expect(parseBoolean('true')).toBe(true)
      expect(parseBoolean('false')).toBe(false)
    })

    it('should return undefined for non-boolean', () => {
      expect(parseBoolean('"string"')).toBeUndefined()
    })
  })

  describe('parseString', () => {
    it('should parse string from JSON', () => {
      expect(parseString('"test"')).toBe('test')
    })

    it('should return undefined for non-string', () => {
      expect(parseString('123')).toBeUndefined()
    })
  })

  describe('parseNumber', () => {
    it('should parse number from JSON', () => {
      expect(parseNumber('123')).toBe(123)
    })

    it('should return undefined for non-number', () => {
      expect(parseNumber('"string"')).toBeUndefined()
    })
  })

  describe('isBoolean', () => {
    it('should check if value is boolean', () => {
      expect(isBoolean(true)).toBe(true)
      expect(isBoolean(false)).toBe(true)
      expect(isBoolean('true')).toBe(false)
    })
  })

  describe('isString', () => {
    it('should check if value is string', () => {
      expect(isString('test')).toBe(true)
      expect(isString(123)).toBe(false)
    })
  })

  describe('isKeyOf', () => {
    it('should check if key exists in object', () => {
      const obj = {a: 1, b: 2}
      expect(isKeyOf('a', obj)).toBe(true)
      expect(isKeyOf('c', obj)).toBe(false)
      expect(isKeyOf(123, obj)).toBe(false)
    })
  })

  describe('getKeys', () => {
    it('should get object keys', () => {
      const obj = {a: 1, b: 2}
      expect(getKeys(obj)).toEqual(['a', 'b'])
    })
  })

  describe('isNonNullable', () => {
    it('should check if value is not null or undefined', () => {
      expect(isNonNullable(1)).toBe(true)
      expect(isNonNullable(null)).toBe(false)
      expect(isNonNullable(undefined)).toBe(false)
    })
  })

  describe('isNumber', () => {
    it('should check if value is valid number', () => {
      expect(isNumber(123)).toBe(true)
      expect(isNumber(NaN)).toBe(false)
      expect(isNumber(Infinity)).toBe(false)
      expect(isNumber('123')).toBe(false)
    })
  })

  describe('isPositiveNumber', () => {
    it('should check if value is positive number', () => {
      expect(isPositiveNumber(123)).toBe(true)
      expect(isPositiveNumber(-123)).toBe(false)
      expect(isPositiveNumber(0)).toBe(false)
    })
  })

  describe('isArrayOfString', () => {
    it('should check if value is array of strings', () => {
      expect(isArrayOfString(['a', 'b'])).toBe(true)
      expect(isArrayOfString([1, 2])).toBe(false)
      expect(isArrayOfString('string')).toBe(false)
    })
  })

  describe('isStringOrArrayOfString', () => {
    it('should check if value is string or array of strings', () => {
      expect(isStringOrArrayOfString('test')).toBe(true)
      expect(isStringOrArrayOfString(['a', 'b'])).toBe(true)
      expect(isStringOrArrayOfString(123)).toBe(false)
    })
  })

  describe('createTypeGuardFromSchema', () => {
    it('should create type guard from zod schema', () => {
      const schema = z.string()
      const guard = createTypeGuardFromSchema(schema)
      expect(guard('test')).toBe(true)
      expect(guard(123)).toBe(false)
    })
  })

  describe('isRecord', () => {
    it('should check if value is record', () => {
      expect(isRecord({a: 1})).toBe(true)
      expect(isRecord([])).toBe(false)
      expect(isRecord('string')).toBe(false)
    })
  })

  describe('isArray', () => {
    it('should check if value is array', () => {
      expect(isArray([1, 2])).toBe(true)
      expect(isArray({})).toBe(false)
    })
  })

  describe('isUrl', () => {
    it('should check if value is valid URL', () => {
      expect(isUrl('https://example.com')).toBe(true)
      expect(isUrl('not-a-url')).toBe(false)
    })
  })

  describe('isArrayOfType', () => {
    it('should check if array matches type predicate', () => {
      expect(isArrayOfType([1, 2, 3], isNumber)).toBe(true)
      expect(isArrayOfType(['a', 'b'], isString)).toBe(true)
      expect(isArrayOfType([1, 'a'], isNumber)).toBe(false)
    })
  })

  describe('isStringLiteral', () => {
    it('should check if value is in literal array', () => {
      const literals = ['a', 'b', 'c'] as const
      expect(isStringLiteral(literals, 'a')).toBe(true)
      expect(isStringLiteral(literals, 'd')).toBe(false)
    })
  })
})
