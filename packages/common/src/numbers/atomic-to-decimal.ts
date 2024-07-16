import {BigNumber} from 'bignumber.js'

const pattern = /\d+/g

/**
 * Converts an atomic value to its decimal representation.
 *
 * @param {Object} options - The options for the conversion.
 * @param {string} options.value - The atomic value to convert,
 * exponential e.g 1e+4 will result in 14, only numbers are taken, negative sign is ignored.
 * @param {number} options.decimals - The number of decimal places (positive), it will round down (BigNumber.ROUND_DOWN).
 *
 * @returns {BigNumber} The decimal representation from the atomic value.
 */
export function atomicToDecimal({
  value,
  decimals,
}: {
  value: string | bigint
  decimals: number
}) {
  const matches = value.toString().match(pattern)
  if (!matches) return new BigNumber(0)

  const combinedNumberString = matches.join('')
  const bn = new BigNumber(combinedNumberString)

  return bn
    .shiftedBy(-decimals)
    .decimalPlaces(Math.abs(decimals), BigNumber.ROUND_DOWN)
}
