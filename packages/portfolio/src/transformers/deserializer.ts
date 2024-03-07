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

export const tokenBalanceReviverMapping: StorageReviverMapping = {
  balance: StorageReviverType.AsBigInt,
  lockedInBuiltTxs: StorageReviverType.AsBigInt,
}

export const deserializer = freeze(
  {
    balance: storageDeserializerMaker(balanceStorageReviverMapping),
    tokenDiscovery: storageDeserializerMaker(
      tokenDiscoveryStorageReviverMapping,
    ),
    tokenBalance: storageDeserializerMaker(tokenBalanceReviverMapping),
  },
  true,
)
