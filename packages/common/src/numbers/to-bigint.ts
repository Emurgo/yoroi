import BigNumber from 'bignumber.js'

/**
 * @description Converts to a bigint in atomic units
 * don't use this to format inputs use parseDecimal instead
 * bare in mind that only '.' is accepted as decimal separator
 * if you pass a localized string it will keep only '.-0-9' characters
 * which means that your decimal separator can affect the result in languages that use ',' or ' ' as decimal separator
 *
 * @param {string | number | BigNumber} quantity
 * @param {number[0]} decimalPlaces
 * @param {boolean} absolute
 * @returns bigint with atomic units
 *
 * @example
 * toBigInt('123456789', 0) // => 123456789n
 * toBigInt('123456789.000000000000000001', 18) // => 123456789000000000000000001n
 * toBigInt('-1', 18) // => -1000000000000000000n
 */
export function toBigInt(
  quantity: string | number | BigNumber,
  decimalPlaces = 0,
  absolute = false,
): bigint {
  const sanitized =
    typeof quantity === 'string'
      ? quantity.replace(/(?!^-)[^\d.-]/g, '')
      : quantity
  const bigNumber = BigNumber(sanitized || 0)

  const scaledNumber = bigNumber.shiftedBy(decimalPlaces)

  const bi = BigInt(scaledNumber.toFixed(0, BigNumber.ROUND_DOWN))

  if (!absolute) return bi

  return bi < 0n ? -bi : bi
}
