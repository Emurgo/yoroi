import {
  StorageReviverMapping,
  StorageReviverType,
  storageDeserializerMaker,
} from '@yoroi/common'
import {freeze} from 'immer'

import {parseTokenBalance} from '../validators/token-balance'
import {parseTokenDiscoveryWithCacheRecord} from '../validators/token-discovery'
import {parsePrimaryBreakdown} from '../validators/primary-breakdown'

export const tokenDiscoveryReviverMapping: StorageReviverMapping = {
  supply: StorageReviverType.AsBigInt,
}

export const tokenBalanceReviverMapping: StorageReviverMapping = {
  balance: StorageReviverType.AsBigInt,
}

export const primaryBalanceBreakdownReviverMapping: StorageReviverMapping = {
  availableRewards: StorageReviverType.AsBigInt,
  totalFromTxs: StorageReviverType.AsBigInt,
  lockedAsStorageCost: StorageReviverType.AsBigInt,
}

const tokenBalanceDeserializer = (jsonString: string | null) => {
  if (jsonString == null) return null
  const record = storageDeserializerMaker(tokenBalanceReviverMapping)(
    jsonString,
  )
  const parsed = parseTokenBalance(record)
  return parsed ?? null
}

const tokenDiscoveryWithCacheDeserializer = (jsonString: string | null) => {
  if (jsonString == null) return null
  const record = storageDeserializerMaker(tokenDiscoveryReviverMapping)(
    jsonString,
  )
  const parsed = parseTokenDiscoveryWithCacheRecord(record)
  return parsed ?? null
}

const primaryBalanceBreakdownDeserializer = (jsonString: string | null) => {
  if (jsonString == null) return null
  const record = storageDeserializerMaker(
    primaryBalanceBreakdownReviverMapping,
  )(jsonString)
  const parsed = parsePrimaryBreakdown(record)
  return parsed ?? null
}

export const deserializers = freeze(
  {
    tokenDiscoveryWithCache: tokenDiscoveryWithCacheDeserializer,
    tokenBalance: tokenBalanceDeserializer,
    primaryBreakdown: primaryBalanceBreakdownDeserializer,
  },
  true,
)
