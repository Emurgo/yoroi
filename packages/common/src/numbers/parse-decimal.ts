import {Numbers} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'

/**
 * Parses a decimal number from a string and returns the parsed value as a BigNumber.
 *
 * @param value - The string to parse, negative sign is ignored.
 * @param decimalPlaces - The number of decimal places to round (BigNumber.ROUND_DOWN).
 * @param format - The locale format to use for formatting the parsed value.
 *
 * @returns An object containing the string and the parsed value as a BigNumber.
 */
export function parseDecimal({
  value,
  decimalPlaces,
  format,
}: {
  value: string | number | BigNumber
  decimalPlaces: number
  format: Numbers.Locale
}) {
  const {decimalSeparator} = format
  const drop = new RegExp(`[^0-9${decimalSeparator}]`, 'g')

  const cleanedText = value.toString().replaceAll(drop, '')
  const sanitizedText = cleanedText.replace(decimalSeparator, '.')

  const [intPart, decPart] = sanitizedText.split('.')
  if (!decPart) {
    const int = !intPart ? '0' : intPart
    const bn = new BigNumber(int).decimalPlaces(
      decimalPlaces,
      BigNumber.ROUND_DOWN,
    )
    const bi = BigInt(
      new BigNumber(int)
        .decimalPlaces(decimalPlaces, BigNumber.ROUND_DOWN)
        .shiftedBy(decimalPlaces)
        .toFixed(0, BigNumber.ROUND_DOWN),
    )
    return {text: cleanedText, bn, bi}
  }

  const inputWithTrailing = `${intPart}.${decPart.slice(0, decimalPlaces)}1`
  const startsWithDecimal = sanitizedText.startsWith('.')
  const formattedInput = new BigNumber(inputWithTrailing)
    .toFormat(format)
    .slice(0, -1)
  const sanitizedInput = startsWithDecimal
    ? formattedInput.replace(`0${decimalSeparator}`, decimalSeparator)
    : formattedInput
  const numericValue = `${intPart}.${decPart}`
  const bn = new BigNumber(numericValue).decimalPlaces(
    decimalPlaces,
    BigNumber.ROUND_DOWN,
  )
  const bi = BigInt(
    bn.shiftedBy(decimalPlaces).toFixed(0, BigNumber.ROUND_DOWN),
  )

  return {text: sanitizedInput, bn, bi}
}
