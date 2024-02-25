import {
  StorageReviverMapping,
  StorageReviverType,
  storageDeserializer,
} from '@yoroi/common'
import {freeze} from 'immer'

export const balanceStorageReviverMapping: StorageReviverMapping = {
  balance: StorageReviverType.AsBigInt,
}

export const tokenDiscoveryStorageReviverMapping: StorageReviverMapping = {
  supply: StorageReviverType.AsBigInt,
}

export const storageDeserializers = freeze(
  {
    balance: storageDeserializer(balanceStorageReviverMapping),
    tokenDiscovery: storageDeserializer(tokenDiscoveryStorageReviverMapping),
  },
  true,
)
