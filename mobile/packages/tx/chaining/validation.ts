import type {
  ChainValidationResult,
  ChainedTransaction,
  TransactionChain,
} from './types'

/**
 * Validate transaction chain
 */
export function validateChain(chain: TransactionChain): ChainValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for circular dependencies
  const visited = new Set<string>()
  const visiting = new Set<string>()

  function checkCircular(tx: ChainedTransaction): boolean {
    if (visiting.has(tx.transactionId)) {
      errors.push(`Circular dependency detected: ${tx.transactionId}`)
      return true
    }

    if (visited.has(tx.transactionId)) {
      return false
    }

    visiting.add(tx.transactionId)

    if (tx.dependsOn) {
      const dependsOnTx = chain.transactions.find(
        (t) => t.transactionId === tx.dependsOn,
      )
      if (!dependsOnTx) {
        errors.push(
          `Transaction ${tx.transactionId} depends on unknown transaction ${tx.dependsOn}`,
        )
        visiting.delete(tx.transactionId)
        return true
      }
      if (checkCircular(dependsOnTx)) {
        visiting.delete(tx.transactionId)
        return true
      }
    }

    visiting.delete(tx.transactionId)
    visited.add(tx.transactionId)
    return false
  }

  // Check all transactions for circular dependencies
  for (const tx of chain.transactions) {
    checkCircular(tx)
  }

  // Check chain order
  const sorted = [...chain.transactions].sort(
    (a, b) => a.chainIndex - b.chainIndex,
  )
  for (let i = 0; i < sorted.length; i++) {
    const tx = sorted[i]!
    if (tx.dependsOn) {
      const dependsOnIndex = sorted.findIndex(
        (t) => t.transactionId === tx.dependsOn,
      )
      if (dependsOnIndex >= i) {
        errors.push(
          `Transaction ${tx.transactionId} depends on transaction ${tx.dependsOn} which comes later in chain`,
        )
      }
    }
  }

  // Check for duplicate transaction IDs
  const txIds = new Set<string>()
  for (const tx of chain.transactions) {
    if (txIds.has(tx.transactionId)) {
      errors.push(`Duplicate transaction ID: ${tx.transactionId}`)
    }
    txIds.add(tx.transactionId)
  }

  // Warnings
  if (chain.transactions.length > 5) {
    warnings.push('Large transaction chain may have high failure risk')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Get transaction submission order
 */
export function getSubmissionOrder(chain: TransactionChain): string[] {
  // Sort by chain index (dependencies should come first)
  const sorted = [...chain.transactions].sort(
    (a, b) => a.chainIndex - b.chainIndex,
  )
  return sorted.map((tx) => tx.transactionId)
}
