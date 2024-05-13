import BigNumber from 'bignumber.js'

/**
 * @description Converts a number to a bigint in atomic units
 * don't use this to format inputs use parseInputToBigInt instead
 *
 * @param quantity string | number | BigNumber
 * @param decimalPlaces
 * @returns bigint with atomic units
 *
 * @example
 * toBigInt('123456789', 0) // => 123456789n
 * toBigInt('123456789.000000000000000001', 18) // => 123456789000000000000000001n
 * toBigInt('1', 18) // => 1000000000000000000n
 */
export function toBigInt(
  quantity: string | number | BigNumber,
  decimalPlaces: number,
): bigint {
  const bigNumber = BigNumber(quantity || 0)

  const scaledNumber = bigNumber.shiftedBy(decimalPlaces)

  return BigInt(scaledNumber.toFixed(0, BigNumber.ROUND_DOWN))
}
