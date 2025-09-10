import {numberReplacer} from '../../numbers/number-replacer'

/**
 * Serializes the given object into a JSON string, with support for BigInt and BigNumber values.
 * Since BigInt and BigNumber are not supported by JSON.stringify, it serialize them as strings.
 *
 * @param toStringify - The object to be serialized.
 * @returns A stringfied JSON object with BigInt and BigNumber values serialized as strings.
 * @summary This is not a replacer function, it will retun a stringified JSON object direclty.
 */
export const storageSerializer = (toStringify: unknown) => {
  return JSON.stringify(toStringify, numberReplacer)
}
