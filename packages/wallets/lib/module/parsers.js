import { z } from 'zod';

// -------
// PARSERS
export const parseBoolean = data => {
  const parsed = parseSafe(data);
  return isBoolean(parsed) ? parsed : undefined;
};
export const parseString = data => {
  const parsed = parseSafe(data);
  return isString(parsed) ? parsed : undefined;
};
export const parseSafe = text => {
  try {
    return JSON.parse(text);
  } catch (_) {
    return undefined;
  }
};

// -----------
// TYPE GUARDS
export const isBoolean = data => typeof data === 'boolean';
export const isString = data => typeof data === 'string';
export const isNonNullable = data => data !== null && data !== undefined;
export const isNumber = data => typeof data === 'number' && !Number.isNaN(data) && Number.isFinite(data);
export const createTypeGuardFromSchema = schema => data => {
  return schema.safeParse(data).success;
};
export const isRecord = createTypeGuardFromSchema(z.record(z.unknown()));
export const isArray = createTypeGuardFromSchema(z.array(z.unknown()));
export function isArrayOfType(data, predicate) {
  return isArray(data) && data.every(predicate);
}
//# sourceMappingURL=parsers.js.map