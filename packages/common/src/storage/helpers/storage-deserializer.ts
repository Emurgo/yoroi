import BigNumber from 'bignumber.js'

import {parseSafe} from '../../utils/parsers'

export enum StorageReviverType {
  AsBigInt = 'AsBigInt',
  AsBigNumber = 'AsBigNumber',
}
export type StorageReviverMapping = {
  [propertyName: string]: StorageReviverType
}

export const storageDeserializer = (mapping: StorageReviverMapping) => {
  return (jsonString: string) => {
    const parsed = parseSafe(jsonString)
    if (parsed === undefined) return null

    const reviver = (key: string, value: any) => {
      switch (mapping[key]) {
        case StorageReviverType.AsBigInt:
          return BigInt(value)
        case StorageReviverType.AsBigNumber:
          return new BigNumber(value)
        default:
          return value
      }
    }

    const convertProperties = (obj: any): unknown => {
      if (obj !== null && typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
          obj[key] = reviver(key, obj[key])
        })
      }
      return obj
    }

    return convertProperties(parsed)
  }
}
