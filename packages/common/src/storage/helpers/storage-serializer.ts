import BigNumber from 'bignumber.js'

/**
 * Serializes the given object into a JSON string, with support for BigInt and BigNumber values.
 * Since BigInt and BigNumber are not supported by JSON.stringify, it serialize them as strings.
 *
 * @param toStringify - The object to be serialized.
 * @returns A stringfied JSON object with BigInt and BigNumber values serialized as strings.
 */
export const storageSerializer = (toStringify: unknown) => {
  const replacer = (_: unknown, value: unknown) => {
    if (typeof value === 'bigint' || BigNumber.isBigNumber(value)) {
      return value.toString()
    }
    return value
  }

  return JSON.stringify(toStringify, replacer)
}
