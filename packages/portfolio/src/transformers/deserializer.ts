import {
  StorageReviverMapping,
  StorageReviverType,
  storageDeserializerMaker,
} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

export const balanceStorageReviverMapping: StorageReviverMapping<Portfolio.Amount> =
  {
    quantity: StorageReviverType.AsBigInt,
  }

export const tokenDiscoveryStorageReviverMapping: StorageReviverMapping<Portfolio.Token.Discovery> =
  {
    supply: StorageReviverType.AsBigInt,
  }

export const tokenBalanceReviverMapping: StorageReviverMapping<Portfolio.Token.Balance> =
  {
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
