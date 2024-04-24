import BigNumber from 'bignumber.js'
import {freeze} from 'immer'

export function splitBigInt(
  bigInt: bigint,
  decimalPlaces: number,
): {int: bigint; dec: bigint} {
  const scale: bigint = BigInt(10) ** BigInt(decimalPlaces)
  const integerPart: bigint = bigInt / scale
  const decimalPart: bigint = bigInt % scale

  return freeze({
    int: integerPart,
    dec: decimalPart,
    bn: new BigNumber(`${integerPart}.${decimalPart}`),
  })
}
