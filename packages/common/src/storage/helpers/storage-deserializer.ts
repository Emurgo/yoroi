import BigNumber from 'bignumber.js'

export enum StorageReviverType {
  AsBigInt = 'AsBigInt',
  AsBigNumber = 'AsBigNumber',
}
export type StorageReviverMapping = {
  [propertyName: string]: StorageReviverType
}

export const storageDeserializer = (mapping: StorageReviverMapping) => {
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

  return (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString, (key, value) => {
        if (key && mapping[key]) {
          return reviver(key, value)
        }
        return value
      })
      return convertProperties(parsed)
    } catch (e) {
      return null
    }
  }
}
