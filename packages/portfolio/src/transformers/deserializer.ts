import {
  StorageReviverMapping,
  StorageReviverType,
  storageDeserializerMaker,
} from '@yoroi/common'
import {freeze} from 'immer'
import {parseTokenBalance} from '../validators/token-balance'

export const balanceStorageReviverMapping: StorageReviverMapping = {
  quantity: StorageReviverType.AsBigInt,
}

export const tokenDiscoveryReviverMapping: StorageReviverMapping = {
  supply: StorageReviverType.AsBigInt,
}

export const tokenBalanceReviverMapping: StorageReviverMapping = {
  balance: StorageReviverType.AsBigInt,
  lockedInBuiltTxs: StorageReviverType.AsBigInt,
}

const tokenBalanceDeserializer = (jsonString: string | null) => {
  if (jsonString == null) return null
  const record = storageDeserializerMaker(tokenBalanceReviverMapping)(
    jsonString,
  )
  const parsed = parseTokenBalance(record)
  return !parsed ? null : parsed
}

// TODO: revisit -> discoveryWithCache
const tokenDiscoveryDeserializer = (jsonString: string | null) => {
  if (jsonString == null) return null
  const record = storageDeserializerMaker(tokenDiscoveryReviverMapping)(
    jsonString,
  )
  const parsed = parseTokenBalance(record)
  return !parsed ? null : parsed
}

export const deserializer = freeze(
  {
    tokenDiscovery: tokenDiscoveryDeserializer,
    tokenBalance: tokenBalanceDeserializer,
  },
  true,
)
