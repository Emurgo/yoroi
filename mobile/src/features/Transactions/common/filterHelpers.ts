import {Amounts} from '@yoroi/cardano-wallet'
import {isArray, isString} from '@yoroi/common'
import {Balance, WalletTransaction} from '@yoroi/types'

import BigNumber from 'bignumber.js'

import {getOperationTypeKey} from './getOperationTypeKey'
import {TransactionSummary} from './types'

/**
 * Extract searchable text from transaction metadata
 */
export const extractMetadataText = (
  metadata: WalletTransaction['metadata'] | undefined,
): string => {
  if (!metadata) return ''

  const messages: string[] = []
  for (const item of metadata) {
    if (!item?.label) continue

    if (
      item.map_json &&
      !isArray(item.map_json) &&
      typeof item.map_json === 'object'
    ) {
      const msg = (item.map_json as Record<string, unknown>).msg
      if (isArray(msg)) {
        messages.push(...msg.map((m) => String(m)))
      } else if (isString(msg)) {
        messages.push(msg)
      }
    }
    if (item.text_scalar) {
      messages.push(String(item.text_scalar))
    }
  }

  return messages.join(' ').toLowerCase()
}

/**
 * Get operation type key for a transaction summary
 */
export const getTransactionOperationTypeKey = (
  transaction: TransactionSummary,
): string | null => {
  const walletTransactionLike = {
    id: transaction.id,
    certificates: transaction.certificates,
    withdrawals: transaction.withdrawals,
    metadata: transaction.metadata,
    inputs: transaction.inputs,
    outputs: transaction.outputs,
  } as WalletTransaction | undefined

  return getOperationTypeKey(
    walletTransactionLike,
    transaction.direction,
    transaction.amount,
    transaction.metadata,
    transaction.inputs,
    transaction.outputs,
    transaction.delta,
  )
}

/**
 * Get ADA amount from transaction amounts
 */
export const getAdaAmount = (
  amounts: Balance.Amounts,
  primaryTokenId: string = '.',
): BigNumber => {
  const adaAmount = Amounts.getAmount(amounts, primaryTokenId)
  return new BigNumber(adaAmount.quantity)
}
