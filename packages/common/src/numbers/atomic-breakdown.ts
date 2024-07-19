import BigNumber from 'bignumber.js'
import {freeze} from 'immer'

export function atomicBreakdown(bigInt: bigint, decimalPlaces: number) {
  const scale: bigint = BigInt(10) ** BigInt(decimalPlaces)

  const isNegative = bigInt < 0
  const sign = isNegative ? '-' : ''
  const signAdjust = isNegative ? -1n : 1n

  const absoluteBigInt = signAdjust * bigInt
  const integer = (absoluteBigInt / scale).toString()
  const fraction =
    decimalPlaces > 0
      ? (absoluteBigInt % scale).toString().padStart(decimalPlaces, '0')
      : ''
  const separator = decimalPlaces > 0 ? '.' : ''

  const str = `${sign}${integer}${separator}${fraction}`

  const bn = new BigNumber(str)

  return freeze({
    decimalPlaces,

    bi: bigInt,
    integer,
    fraction,

    bn,
    str,
  })
}
