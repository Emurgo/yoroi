import {isArrayOfType, isString} from './parsers'

/**
 * Returns a string representation of the given value, if possible.
 * @param {string | string[] | undefined | null} value - The value to convert to a string.
 * @returns {string | null} A string representation of the value, or null if not possible.
 */
export function asConcatenedString(
  value: string | string[] | undefined | null,
): string | undefined {
  if (value === null || value === undefined) return
  if (isString(value)) return value as string
  if (isArrayOfType(value, isString)) return (value as string[]).join('')
  return // TS
}
