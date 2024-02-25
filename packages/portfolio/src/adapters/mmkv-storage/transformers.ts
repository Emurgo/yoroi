import {
  StorageReviverMapping,
  StorageReviverType,
  storageDeserializerMaker,
} from '@yoroi/common'
import {freeze} from 'immer'

export const balanceStorageReviverMapping: StorageReviverMapping = {
  quantity: StorageReviverType.AsBigInt,
}

export const tokenDiscoveryStorageReviverMapping: StorageReviverMapping = {
  supply: StorageReviverType.AsBigInt,
}

export const storageDeserializers = freeze(
  {
    balance: storageDeserializerMaker(balanceStorageReviverMapping),
    tokenDiscovery: storageDeserializerMaker(
      tokenDiscoveryStorageReviverMapping,
    ),
  },
  true,
)
