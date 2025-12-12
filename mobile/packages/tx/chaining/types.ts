import {TransactionHash} from '@yoroi/types'

import {UnsignedTransaction} from '../transaction-builder/types'

/**
 * Chained transaction reference
 */
export type ChainedTransactionRef = {
  txHash: TransactionHash
  txIndex: number
}

/**
 * Chained transaction information
 */
export type ChainedTransaction = {
  transaction: UnsignedTransaction
  transactionId: string // Transaction hash
  dependsOn?: string // Transaction ID this depends on
  chainIndex: number // Order in chain (0 = first)
}

/**
 * Transaction chain
 */
export type TransactionChain = {
  transactions: ChainedTransaction[]
  totalFees: string // Total fees for entire chain
}

/**
 * Chain validation result
 */
export type ChainValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
}
