import {Balance} from '@yoroi/types'

import {
  TransactionDirection,
  TransactionStatus,
  WalletTransaction,
} from '~/wallets/types/other'

/**
 * Summary information for a transaction, used in transaction lists
 * This is a simplified version derived from WalletTransaction
 */
export type TransactionSummary = {
  id: string
  direction: TransactionDirection
  amount: Balance.Amounts
  delta: Balance.Amounts
  submittedAt: string | null | undefined
  lastUpdatedAt: string
  status: TransactionStatus
  certificates: WalletTransaction['certificates']
  withdrawals: WalletTransaction['withdrawals']
}
