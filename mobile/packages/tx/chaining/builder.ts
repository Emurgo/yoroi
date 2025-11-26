import {Balance} from '@yoroi/types'

import {TransactionBuilderState, addInput} from '../transaction-builder/builder'
import type {UnsignedTransaction} from '../transaction-builder/types'
import {ModernUtxo} from '../utxo/models'
import type {
  ChainedTransaction,
  ChainedTransactionRef,
  TransactionChain,
} from './types'

/**
 * Add chained input (reference to unconfirmed transaction output)
 *
 * @param state - Transaction builder state
 * @param chainedRef - Reference to chained transaction output
 * @param outputAmounts - Amounts in the chained output (for fee calculation)
 * @returns Updated transaction builder state
 */
export function addChainedInput(
  state: TransactionBuilderState,
  chainedRef: ChainedTransactionRef,
  outputAmounts: Balance.Amounts,
): TransactionBuilderState {
  // Create a synthetic UTXO from the chained transaction reference
  // Note: This UTXO doesn't exist on-chain yet, so we create a placeholder
  const chainedUtxo: ModernUtxo = {
    receiver: '', // Will be set from actual transaction output
    txHash: chainedRef.txHash,
    txIndex: chainedRef.txIndex,
    balance: outputAmounts,
    toTransactionUnspentOutputHex: () => {
      throw new Error(
        'Cannot serialize chained UTXO - transaction not confirmed',
      )
    },
    toTransactionUnspentOutput: () => {
      throw new Error('Cannot convert chained UTXO - transaction not confirmed')
    },
  }

  // Add as regular input (CSL will handle it as a regular input)
  // Note: The actual transaction building will need to handle chained transactions
  // specially, as they reference unconfirmed outputs
  return addInput(state, chainedUtxo)
}

/**
 * Create chained transaction from transaction builder state
 */
export function createChainedTransaction(
  transaction: UnsignedTransaction,
  transactionId: string,
  dependsOn?: string,
  chainIndex = 0,
): ChainedTransaction {
  return {
    transaction,
    transactionId,
    dependsOn,
    chainIndex,
  }
}

/**
 * Build transaction chain
 */
export function buildTransactionChain(
  transactions: ChainedTransaction[],
): TransactionChain {
  // Calculate total fees
  const totalFees = transactions.reduce((sum, tx) => {
    const fee = tx.transaction.options.manualFee?.['.'] || '0'
    return (BigInt(sum) + BigInt(fee)).toString()
  }, '0')

  return {
    transactions,
    totalFees,
  }
}
