import BigNumber from 'bignumber.js'

export function replacer(_: unknown, value: unknown) {
  return typeof value === 'bigint' || BigNumber.isBigNumber(value) ? value.toString() : value
}
