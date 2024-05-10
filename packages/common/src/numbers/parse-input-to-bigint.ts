import {Numbers} from '@yoroi/types'
import BigNumber from 'bignumber.js'

/**
 * Parses a localized numeric input into a formatted string and a corresponding
 * BigInt representation, adjusting for specified decimal places and precision
 * Don't use this to parse non-inputs, use toBigInt instead
 * @note It will append 0 if starting with a decimal separator
 *
 * @param options - The options for parsing the input
 * @param options.input - The input string to be parsed
 * @param options.decimalPlaces - The number of decimal places to consider
 * @param options.format - The locale format for numbers
 * @param [options.precision] - The precision for rounding the number (optional, defaults to decimalPlaces)
 *
 * @returns {[string, bigint]} - A tuple containing the formatted string and BigInt value
 *
 * @example
 * parseInputToBigInt({input: '', decimalPlaces: 3, format: italian}) // => ['', 0n]
 * parseInputToBigInt({input: '1', decimalPlaces: 3, format: italian}) // => ['1', 1000n]
 * parseInputToBigInt({input: '123,55', decimalPlaces: 3, format: italian}) // => ['123,55', 123550n]
 */
export function parseInputToBigInt({
  input,
  decimalPlaces,
  format,
  precision = decimalPlaces,
}: {
  input: string
  decimalPlaces: number
  format: Numbers.Locale
  precision?: number
}): [string, bigint] {
  const {decimalSeparator} = format
  const invalidCharsRegex = new RegExp(`[^0-9${decimalSeparator}]`, 'g')
  const sanitizedInput =
    input === '' ? '' : input.replace(invalidCharsRegex, '')

  if (sanitizedInput === '') return ['', 0n]
  if (sanitizedInput.startsWith(decimalSeparator))
    return [`0${decimalSeparator}`, 0n]

  const parts = sanitizedInput.split(decimalSeparator)
  let formattedValue = sanitizedInput
  let numericalValue = sanitizedInput

  if (parts.length <= 1) {
    const quantity = BigInt(
      new BigNumber(numericalValue.replace(decimalSeparator, '.'))
        .decimalPlaces(precision)
        .shiftedBy(decimalPlaces)
        .toFixed(0, BigNumber.ROUND_DOWN),
    )
    return [
      new BigNumber(formattedValue.replace(decimalSeparator, '.')).toFormat(),
      quantity,
    ]
  }

  const [integerPart, decimalPart] = parts
  formattedValue = `${integerPart}${decimalSeparator}${decimalPart?.slice(
    0,
    precision,
  )}1`
  numericalValue = `${integerPart}${decimalSeparator}${decimalPart?.slice(
    0,
    precision,
  )}`

  const formattedNumber = new BigNumber(
    formattedValue.replace(decimalSeparator, '.'),
  ).toFormat()

  // Remove the temporary character used for formatting purposes
  const textOutput = formattedNumber.slice(0, -1)

  const quantity = BigInt(
    new BigNumber(numericalValue.replace(decimalSeparator, '.'))
      .decimalPlaces(precision)
      .shiftedBy(decimalPlaces)
      .toFixed(0, BigNumber.ROUND_DOWN),
  )

  return [textOutput, quantity]
}
