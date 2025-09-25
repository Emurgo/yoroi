import {Balance, Numbers} from '@yoroi/types'

import {BigNumber} from 'bignumber.js'

// Local helper to convert BigNumber to string (avoiding circular dependency)
export const asQuantity = (value: BigNumber | number | string) => {
  const bn = new BigNumber(value)
  if (bn.isNaN() || !bn.isFinite()) {
    throw new Error('Invalid quantity')
  }
  return bn.toString(10) as Balance.Quantity
}

export type ParseNumberFromTextOptions = {
  /** The input text to parse */
  text: string
  /** Token denomination (e.g., 6 for ADA) - optional for unitless numbers */
  denomination?: number
  /** Locale format for decimal separator - optional, defaults to English locale for sanitization */
  format?: Numbers.Locale
  /** Maximum decimal places user can input (UI limit) - defaults to denomination or 12 */
  precision?: number
}

export type ParseNumberFromTextResult = {
  /** The sanitizedInput input string */
  sanitizedInput: string
  /** The formatted input string to display (undefined when format is not provided) */
  formattedValue: string | undefined
  /** Number in valid JS number format */
  numericValue: number
  /** The parsed quantity in atomic units (undefined for unitless numbers) */
  quantity?: Balance.Quantity
}

/**
 * Parses a number from text input with proper locale support and formatting.
 * Handles keyboard-locale mismatch, intermediate states, and preserves formatting.
 *
 * @param options - Configuration options for parsing
 * @returns Object containing display value and parsed quantity
 *
 * @example
 * // With denomination (for tokens)
 * parseNumberFromText({
 *   text: '123.45',
 *   denomination: 6,
 *   format: { decimalSeparator: '.' },
 *   precision: 6
 * })
 * // Returns: { formattedValue: '123.45', quantity: '123450000' }
 *
 * @example
 * // Without denomination (for unitless numbers)
 * parseNumberFromText({
 *   text: '123.45',
 *   format: { decimalSeparator: '.' }
 * })
 * // Returns: { formattedValue: '123.45', quantity: undefined }
 *
 * @example
 * // Without format (formattedValue will be undefined)
 * parseNumberFromText({
 *   text: '123.45',
 *   denomination: 6
 * })
 * // Returns: { formattedValue: undefined, quantity: '123450000' }
 */
export const parseNumberFromText = ({
  text,
  denomination,
  format,
  precision = denomination ?? 12,
}: ParseNumberFromTextOptions): ParseNumberFromTextResult => {
  // Use English locale (dot as decimal separator) for sanitization when format is not provided
  const decimalSeparator = format?.decimalSeparator ?? '.'

  // Handle keyboard-locale mismatch FIRST
  let normalizedText = text
  if (decimalSeparator === ',' && text.includes('.') && !text.includes(',')) {
    // Locale uses comma, but user typed dot (English keyboard)
    normalizedText = text.replace('.', ',')
  } else if (
    decimalSeparator === '.' &&
    text.includes(',') &&
    !text.includes('.')
  ) {
    // Locale uses dot, but user typed comma (European keyboard)
    normalizedText = text.replace(',', '.')
  }

  // Remove thousands separators (users don't type them, only copy/paste)
  // Keep only digits and the correct decimal separator
  const invalid = new RegExp(`[^0-9${decimalSeparator}]`, 'g')
  let sanitizedInput =
    normalizedText === '' ? '' : normalizedText.replaceAll(invalid, '')

  // Handle multiple decimal separators - keep only the first one
  const decimalSeparatorCount = (
    sanitizedInput.match(new RegExp(`\\${decimalSeparator}`, 'g')) || []
  ).length
  if (decimalSeparatorCount > 1) {
    const firstDecimalIndex = sanitizedInput.indexOf(decimalSeparator)
    sanitizedInput =
      sanitizedInput.substring(0, firstDecimalIndex + 1) +
      sanitizedInput
        .substring(firstDecimalIndex + 1)
        .replaceAll(decimalSeparator, '')
  }

  if (sanitizedInput === '')
    return {
      sanitizedInput,
      formattedValue: format ? '' : undefined,
      numericValue: 0,
      quantity: denomination !== undefined ? '0' : undefined,
    }
  let workingInput = sanitizedInput
  if (workingInput.startsWith(decimalSeparator)) {
    // Prepend '0' to make it a valid number (e.g., '.45' -> '0.45')
    workingInput = `0${workingInput}`
  }

  const parts = workingInput.split(decimalSeparator)

  let fullDecValue = workingInput
  let value = workingInput

  // Only format if format is provided
  let formattedValue: string | undefined
  if (format) {
    let fullDecFormat = new BigNumber(
      fullDecValue.replace(decimalSeparator, '.'),
    ).toFormat()
    // Convert the formatted result back to use the correct decimal separator
    formattedValue = fullDecFormat.replace('.', decimalSeparator)
  }

  if (parts.length <= 1) {
    const bnValue = new BigNumber(
      value.replace(decimalSeparator, '.'),
    ).decimalPlaces(precision)

    const quantity =
      denomination !== undefined
        ? asQuantity(bnValue.shiftedBy(denomination))
        : undefined

    return {
      sanitizedInput: workingInput,
      formattedValue,
      numericValue: bnValue.toNumber(),
      quantity,
    }
  }

  const [int, dec] = parts
  // trailing `1` is to allow the user to type `1.0` without losing the decimal part
  if (dec === '') {
    // No decimal digits, just format the integer part
    fullDecValue = int
    value = int
    if (format) {
      const fullDecFormat = new BigNumber(fullDecValue).toFormat()
      formattedValue = fullDecFormat.replace('.', decimalSeparator)
    }
  } else {
    fullDecValue = `${int}${decimalSeparator}${dec?.slice(0, precision)}1`
    value = `${int}${decimalSeparator}${dec?.slice(0, precision)}`
    if (format) {
      const fullDecFormat = new BigNumber(
        fullDecValue.replace(decimalSeparator, '.'),
      ).toFormat()
      // Remove trailing '1' and convert decimal separator back
      formattedValue = fullDecFormat.slice(0, -1).replace('.', decimalSeparator)
    }
  }

  const bnValue = new BigNumber(
    value.replace(decimalSeparator, '.'),
  ).decimalPlaces(precision)

  const quantity =
    denomination !== undefined
      ? asQuantity(bnValue.shiftedBy(denomination))
      : undefined

  return {
    sanitizedInput: workingInput,
    formattedValue,
    numericValue: bnValue.toNumber(),
    quantity,
  }
}
