import BigNumber from 'bignumber.js'

export enum StorageReviverType {
  AsBigInt = 'AsBigInt',
  AsBigNumber = 'AsBigNumber',
}

export type StorageReviverMapping = {
  [key: string]: StorageReviverType
}

/**
 * Creates a storage deserializer function based on the provided mapping.
 * Since BigInt and BigNumber are not supported by JSON.parse, it stores as strings and revive as BigInt or BigNumber.
 *
 * @param mapping - The mapping of keys to reviver types.
 * @returns JSON object revived according to the mapping, string -> BigInt or BigNumber.
 */
export const storageDeserializerMaker = (mapping: StorageReviverMapping) => {
  const reviver = (key: string, value: any) => {
    switch (mapping[key]) {
      case StorageReviverType.AsBigInt:
        return value == null ? value : BigInt(value)
      case StorageReviverType.AsBigNumber:
      default:
        return value === null ? value : new BigNumber(value)
    }
  }

  const convertProperties = (obj: any): unknown => {
    if (Array.isArray(obj)) {
      return obj.map((item) => convertProperties(item))
    } else if (obj !== null && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        obj[key] = convertProperties(obj[key])
      })
      return obj
    } else {
      return obj
    }
  }

  return (jsonString: string | null) => {
    if (jsonString == null) return null
    try {
      const parsed = JSON.parse(jsonString, (key, value) => {
        if (key && mapping[key]) {
          return reviver(key as any, value)
        }
        return value
      })
      return convertProperties(parsed)
    } catch (e) {
      return null
    }
  }
}
