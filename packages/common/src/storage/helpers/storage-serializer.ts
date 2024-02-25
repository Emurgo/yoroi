import BigNumber from 'bignumber.js'

export const storageSerializer = (toStringify: unknown) => {
  const replacer = (_: unknown, value: unknown) => {
    if (typeof value === 'bigint' || BigNumber.isBigNumber(value)) {
      return value.toString()
    }
    return value
  }

  return JSON.stringify(toStringify, replacer)
}
