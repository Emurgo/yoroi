import {
  StorageReviverMapping,
  StorageReviverType,
  storageDeserializerMaker,
} from '@yoroi/common'
import {freeze} from 'immer'

import {parseTokenBalance} from '../validators/token-balance'
import {parseTokenDiscoveryWithCacheRecord} from '../validators/token-discovery'
import {parsePrimaryBalanceBreakdown} from '../validators/primary-balance-breakdown'

export const tokenDiscoveryReviverMapping: StorageReviverMapping = {
  supply: StorageReviverType.AsBigInt,
}

export const tokenBalanceReviverMapping: StorageReviverMapping = {
  balance: StorageReviverType.AsBigInt,
  lockedInBuiltTxs: StorageReviverType.AsBigInt,
}

export const primaryBalanceBreakdownReviverMapping: StorageReviverMapping = {
  balance: StorageReviverType.AsBigInt,
  lockedInBuiltTxs: StorageReviverType.AsBigInt,
  minRequiredByTokens: StorageReviverType.AsBigInt,
  quantity: StorageReviverType.AsBigInt,
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
  const parsed = parsePrimaryBalanceBreakdown(record)
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
