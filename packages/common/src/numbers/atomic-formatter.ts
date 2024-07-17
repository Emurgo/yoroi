import BigNumber from 'bignumber.js'

import {atomicBreakdown} from './atomic-breakdown'
import {Numbers} from '@yoroi/types'

/**
 * @description Keep the result to display only, internally use bigint,
 * otherwise it will need to localize converters
 * Formats a bigint to a string with the given number of decimal places.
 * @param {Object} options The options to use for formatting.
 * @param options.value The bigint to format.
 * @param options.decimalPlaces The number of decimal places to include.
 * @param options.format The locale format to use for formatting the parsed value.
 * @returns The formatted string.
 *
 * @example
 * atomicFormatter({ value: 123456789000000000000000001n, decimalPlaces: 18 }) // => '123,456,789.000000000000000001'
 * atomicFormatter({ value: 123456789n, decimalPlaces: 0 }) // => '123,456,789'
 * atomicFormatter({ value: 1_000_000_000_000_000_000n, decimalPlaces: 18 }) // => '1.000000000000000000'
 * atomicFormatter({ value: 12345n, decimalPlaces: 2 }) // => '123.45'
 * atomicFormatter({ value: 12345678n, decimalPlaces: 5 }) // => '123.45678'
 */
export function atomicFormatter({
  value,
  decimalPlaces,
  format,
}: {
  value: bigint
  decimalPlaces: number
  format?: Numbers.Locale
}) {
  return atomicBreakdown(value, decimalPlaces).bn.toFormat(
    decimalPlaces,
    BigNumber.ROUND_DOWN,
    format,
  )
}
