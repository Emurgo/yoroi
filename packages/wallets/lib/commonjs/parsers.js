"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isArray = exports.createTypeGuardFromSchema = void 0;
exports.isArrayOfType = isArrayOfType;
exports.parseString = exports.parseSafe = exports.parseBoolean = exports.isString = exports.isRecord = exports.isNumber = exports.isNonNullable = exports.isBoolean = void 0;
var _zod = require("zod");
// -------
// PARSERS
const parseBoolean = data => {
  const parsed = parseSafe(data);
  return isBoolean(parsed) ? parsed : undefined;
};
exports.parseBoolean = parseBoolean;
const parseString = data => {
  const parsed = parseSafe(data);
  return isString(parsed) ? parsed : undefined;
};
exports.parseString = parseString;
const parseSafe = text => {
  try {
    return JSON.parse(text);
  } catch (_) {
    return undefined;
  }
};

// -----------
// TYPE GUARDS
exports.parseSafe = parseSafe;
const isBoolean = data => typeof data === 'boolean';
exports.isBoolean = isBoolean;
const isString = data => typeof data === 'string';
exports.isString = isString;
const isNonNullable = data => data !== null && data !== undefined;
exports.isNonNullable = isNonNullable;
const isNumber = data => typeof data === 'number' && !Number.isNaN(data) && Number.isFinite(data);
exports.isNumber = isNumber;
const createTypeGuardFromSchema = schema => data => {
  return schema.safeParse(data).success;
};
exports.createTypeGuardFromSchema = createTypeGuardFromSchema;
const isRecord = createTypeGuardFromSchema(_zod.z.record(_zod.z.unknown()));
exports.isRecord = isRecord;
const isArray = createTypeGuardFromSchema(_zod.z.array(_zod.z.unknown()));
exports.isArray = isArray;
function isArrayOfType(data, predicate) {
  return isArray(data) && data.every(predicate);
}
//# sourceMappingURL=parsers.js.map