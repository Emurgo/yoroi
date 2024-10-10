import {isArrayOfType, isString} from './parsers'

/**
 * Returns a string representation of the given value, if possible.
 * @param {string | string[] | undefined | null} value - The value to convert to a string.
 * @returns {string} A string representation of the value, or undefined if not possible.
 */
export function asConcatenedString(
  value: string | string[] | undefined | null,
): string | undefined {
  if (value === null || value === undefined) return
  if (isString(value)) return value as string
  if (isArrayOfType(value, isString)) return (value as string[]).join('')
  return // TS
}

export function truncateString({
  value,
  maxLength,
  separator = '...',
}: {
  value: string
  maxLength: number
  separator?: string
}): string {
  if (value.length <= maxLength) return value

  const partLength = Math.floor((maxLength - separator.length) / 2)

  const start = value.substring(0, partLength)
  const end = value.substring(value.length - partLength)

  return `${start}${separator}${end}`
}
