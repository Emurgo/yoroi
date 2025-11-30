import {z} from 'zod'

// -------
// PARSERS
export const parseBoolean = (data: unknown) => {
  const parsed = parseSafe(data)
  return isBoolean(parsed) ? parsed : undefined
}
export const parseString = (data: unknown) => {
  const parsed = parseSafe(data)
  return isString(parsed) ? parsed : undefined
}

export const parseSafe = (text: unknown) => {
  try {
    if (typeof text === 'string') {
      return JSON.parse(text) as unknown
    }
    return undefined
  } catch (_) {
    return undefined
  }
}

export const parseNumber = (data: unknown) => {
  const parsed = parseSafe(data)
  return isNumber(parsed) ? parsed : undefined
}

// -----------
// TYPE GUARDS
export const isBoolean = (data: unknown): data is boolean =>
  typeof data === 'boolean'

export const isString = (data: unknown): data is string =>
  typeof data === 'string'

export const isKeyOf = <T extends Record<string, unknown>>(
  key: unknown,
  obj: T,
): key is keyof T => isString(key) && key in obj

export const getKeys = <T extends Record<string, unknown>>(obj: T) =>
  Object.keys(obj) as (keyof T)[]

export const isNonNullable = <T>(data: T | null | undefined): data is T =>
  data !== null && data !== undefined

export const isNumber = (data: unknown): data is number =>
  typeof data === 'number' && !Number.isNaN(data) && Number.isFinite(data)

export const isPositiveNumber = (data: unknown): data is number =>
  isNumber(data) && data > 0

export const isArrayOfString = (data: unknown): data is string[] =>
  isArrayOfType(data, isString)

export const isStringOrArrayOfString = (
  data: unknown,
): data is string | string[] => isString(data) || isArrayOfString(data)

export const createTypeGuardFromSchema =
  <T>(schema: z.ZodType<T>) =>
  (data: unknown): data is T => {
    return schema.safeParse(data).success
  }

export const isRecord = createTypeGuardFromSchema<Record<string, unknown>>(
  z.record(z.unknown()),
)

export const isArray = createTypeGuardFromSchema<unknown[]>(
  z.array(z.unknown()),
)

export const urlSchema = z.string().url()
export const isUrl = (data: unknown): data is string => {
  return urlSchema.safeParse(data).success
}

export function isArrayOfType<T>(
  data: unknown,
  predicate: (data: unknown) => data is T,
): data is Array<T> {
  return isArray(data) && data.every(predicate)
}

export const isStringLiteral = <T extends string>(
  literals: Readonly<T[]>,
  value: unknown,
) => {
  return literals.includes(value as T)
}

// -----------
// ERROR TYPE GUARDS
export const isError = (error: unknown): error is Error => {
  return (
    error instanceof Error ||
    (isRecord(error) &&
      typeof error.message === 'string' &&
      typeof error.name === 'string')
  )
}

export const hasResponse = (
  error: unknown,
): error is {response: {data?: unknown; status?: number}} => {
  return (
    isRecord(error) &&
    'response' in error &&
    isRecord(error.response) &&
    ('data' in error.response || 'status' in error.response)
  )
}

export const hasRequest = (error: unknown): error is {request: unknown} => {
  return isRecord(error) && 'request' in error
}
