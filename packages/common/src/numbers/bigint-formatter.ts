import {splitBigInt} from './split-bigint'

export function bigintFormatter({
  value,
  decimalPlaces,
}: {
  value: bigint
  decimalPlaces: number
}) {
  return splitBigInt(value, decimalPlaces).bn.toFormat(decimalPlaces)
}
