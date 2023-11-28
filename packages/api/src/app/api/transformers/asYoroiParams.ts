/**
 * Creates a new object containing only the specified keys from the given object.
 *
 * This generic utility function creates a new object by picking the specified keys from
 * the provided object. If a key does not exist in the original object, it is ignored.
 *
 * @template T - The type of the original object.
 * @template K - The type of the keys to pick from the original object.
 * @param {T} obj - The original object from which to pick keys.
 * @param {K[]} keys - An array of keys to pick from the original object.
 * @returns {Pick<T, K>} A new object with only the picked keys.
 */

export const asYoroiParams = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const result: any = {}

  if (obj == null) {
    return result
  }

  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })

  return result
}
