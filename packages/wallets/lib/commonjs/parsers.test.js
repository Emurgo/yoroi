"use strict";

var _zod = require("zod");
var _parsers = require("./parsers");
describe('parsers', () => {
  describe('isArrayOfType', () => {
    it('returns true if array is empty', () => {
      expect((0, _parsers.isArrayOfType)([], _parsers.isString)).toEqual(true);
    });
    it('returns true if array contains only elements of given type', () => {
      expect((0, _parsers.isArrayOfType)(['a', 'b', 'c'], _parsers.isString)).toEqual(true);
    });
    it('returns false if array contains elements of different type', () => {
      expect((0, _parsers.isArrayOfType)(['a', 'b', 1], _parsers.isString)).toEqual(false);
    });
  });
  describe('isString', () => {
    it('returns true if string', () => {
      expect((0, _parsers.isString)('hello')).toEqual(true);
    });
    it('returns false if not string', () => {
      expect((0, _parsers.isString)(123)).toEqual(false);
      expect((0, _parsers.isString)({})).toEqual(false);
      expect((0, _parsers.isString)([])).toEqual(false);
      expect((0, _parsers.isString)(null)).toEqual(false);
      expect((0, _parsers.isString)(undefined)).toEqual(false);
      expect((0, _parsers.isString)(true)).toEqual(false);
    });
  });
  describe('isRecord', () => {
    it('returns true if is an object', () => {
      expect((0, _parsers.isRecord)({})).toEqual(true);
    });
    it('returns false if is not an object or its array or its null', () => {
      expect((0, _parsers.isRecord)([])).toEqual(false);
      expect((0, _parsers.isRecord)(null)).toEqual(false);
      expect((0, _parsers.isRecord)(undefined)).toEqual(false);
      expect((0, _parsers.isRecord)(123)).toEqual(false);
      expect((0, _parsers.isRecord)('hello')).toEqual(false);
      expect((0, _parsers.isRecord)(true)).toEqual(false);
    });
  });
  describe('isNonNullable', () => {
    it('returns true if value is not null nor undefined', () => {
      expect((0, _parsers.isNonNullable)(1)).toEqual(true);
      expect((0, _parsers.isNonNullable)('hello')).toEqual(true);
      expect((0, _parsers.isNonNullable)({})).toEqual(true);
      expect((0, _parsers.isNonNullable)([])).toEqual(true);
      expect((0, _parsers.isNonNullable)(false)).toEqual(true);
      expect((0, _parsers.isNonNullable)(true)).toEqual(true);
      expect((0, _parsers.isNonNullable)(0)).toEqual(true);
      expect((0, _parsers.isNonNullable)('')).toEqual(true);
    });
    it('returns false if null or undefined', () => {
      expect((0, _parsers.isNonNullable)(null)).toEqual(false);
      expect((0, _parsers.isNonNullable)(undefined)).toEqual(false);
    });
  });
  describe('parseBoolean', () => {
    it('should return a boolean if the data is a boolean', () => {
      expect((0, _parsers.parseBoolean)('true')).toBe(true);
      expect((0, _parsers.parseBoolean)('false')).toBe(false);
    });
    it('should return undefined if the data is not a boolean', () => {
      expect((0, _parsers.parseBoolean)('abc')).toBeUndefined();
      expect((0, _parsers.parseBoolean)('123')).toBeUndefined();
    });
  });
  describe('parseString', () => {
    it('should return a string if the data is a string', () => {
      expect((0, _parsers.parseString)('"hello"')).toBe('hello');
    });
    it('should return undefined if the data is not a string', () => {
      expect((0, _parsers.parseString)('true')).toBeUndefined();
      expect((0, _parsers.parseString)('123')).toBeUndefined();
    });
  });
  describe('parseSafe', () => {
    it('should return parsed JSON if valid JSON', () => {
      expect((0, _parsers.parseSafe)('{"key": "value"}')).toEqual({
        key: 'value'
      });
    });
    it('should return undefined if invalid JSON', () => {
      expect((0, _parsers.parseSafe)('{key: value}')).toBeUndefined();
    });
  });
  describe('isBoolean', () => {
    it('should return true if the data is a boolean', () => {
      expect((0, _parsers.isBoolean)(true)).toBe(true);
      expect((0, _parsers.isBoolean)(false)).toBe(true);
    });
    it('should return false if the data is not a boolean', () => {
      expect((0, _parsers.isBoolean)('true')).toBe(false);
    });
  });
  describe('isNumber', () => {
    it('should return true if the data is a number', () => {
      expect((0, _parsers.isNumber)(123)).toBe(true);
    });
    it('should return false if the data is not a number', () => {
      expect((0, _parsers.isNumber)('123')).toBe(false);
    });
  });
  describe('createTypeGuardFromSchema', () => {
    const isPerson = (0, _parsers.createTypeGuardFromSchema)(_zod.z.object({
      name: _zod.z.string(),
      age: _zod.z.number()
    }));
    it('should return true if the data matches the schema', () => {
      expect(isPerson({
        name: 'John',
        age: 30
      })).toBe(true);
    });
    it('should return false if the data does not match the schema', () => {
      expect(isPerson({
        name: 'John',
        age: '30'
      })).toBe(false);
    });
  });
  describe('isArray', () => {
    it('should return true if the data is an array', () => {
      expect((0, _parsers.isArray)(['a', 'b', 'c'])).toBe(true);
    });
    it('should return false if the data is not an array', () => {
      expect((0, _parsers.isArray)('hello')).toBe(false);
    });
  });
});
//# sourceMappingURL=parsers.test.js.map