import {splitBigInt} from './split-bigint'

/**
 * @description Use it only to display, internally use bigint, otherwise it will need to localize converters
 * Formats a bigint to a string with the given number of decimal places.
 * @param value The bigint to format.
 * @param decimalPlaces The number of decimal places to include.
 * @returns The formatted string.
 *
 * @example
 * bigintFormatter({ value: 123456789000000000000000001n, decimalPlaces: 18 }) // => '123,456,789.000000000000000001'
 * bigintFormatter({ value: 123456789n, decimalPlaces: 0 }) // => '123,456,789'
 * bigintFormatter({ value: 1_000_000_000_000_000_000n, decimalPlaces: 18 }) // => '1'
 * bigintFormatter({ value: 12345n, decimalPlaces: 2 }) // => '123.45'
 * bigintFormatter({ value: 12345678n, decimalPlaces: 5 }) // => '123.45678'
 */
export function bigintFormatter({
  value,
  decimalPlaces,
}: {
  value: bigint
  decimalPlaces: number
}) {
  return splitBigInt(value, decimalPlaces).bn.toFormat(decimalPlaces)
}
