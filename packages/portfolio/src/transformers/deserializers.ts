import {
  StorageReviverMapping,
  StorageReviverType,
  storageDeserializerMaker,
} from '@yoroi/common'
import {freeze} from 'immer'

import {parsePrimaryBreakdown} from '../validators/primary-breakdown'
import {parseTokenAmount} from '../validators/token-amount'

export const tokenDiscoveryReviverMapping: StorageReviverMapping = {
  supply: StorageReviverType.AsBigInt,
}

export const tokenAmountReviverMapping: StorageReviverMapping = {
  quantity: StorageReviverType.AsBigInt,
}

export const primaryBalanceBreakdownReviverMapping: StorageReviverMapping = {
  availableRewards: StorageReviverType.AsBigInt,
  totalFromTxs: StorageReviverType.AsBigInt,
  lockedAsStorageCost: StorageReviverType.AsBigInt,
}

const tokenAmountDeserializer = (jsonString: string | null) => {
  if (jsonString == null) return null
  const record = storageDeserializerMaker(tokenAmountReviverMapping)(jsonString)
  const parsed = parseTokenAmount(record)
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
    tokenAmount: tokenAmountDeserializer,
    primaryBreakdown: primaryBalanceBreakdownDeserializer,
  },
  true,
)
