import type {WasmModuleProxy} from '@emurgo/cross-csl-core'

/**
 * Transaction validation result
 */
export type TransactionValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate transaction CBOR before signing
 */
export function validateTransactionCbor(
  csl: WasmModuleProxy,
  cborHex: string,
): TransactionValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check if CBOR is valid hex
  if (!/^[0-9a-fA-F]+$/.test(cborHex)) {
    errors.push('Transaction CBOR must be valid hex string')
    return {valid: false, errors, warnings}
  }

  // Try to parse transaction
  try {
    const tx = csl.Transaction.fromHex(cborHex)
    if (!tx) {
      errors.push('Failed to parse transaction')
      return {valid: false, errors, warnings}
    }

    const txBody = tx.body()
    if (!txBody) {
      errors.push('Transaction body is missing')
      return {valid: false, errors, warnings}
    }

    // Validate inputs
    const inputs = txBody.inputs()
    if (!inputs || inputs.len() === 0) {
      errors.push('Transaction has no inputs')
    }

    // Validate outputs
    const outputs = txBody.outputs()
    if (!outputs || outputs.len() === 0) {
      warnings.push('Transaction has no outputs')
    }

    // Check fee
    const fee = txBody.fee()
    if (!fee || fee.toStr() === '0') {
      warnings.push('Transaction fee is zero')
    }

    // Check TTL
    const ttl = txBody.ttl()
    if (!ttl || ttl === 0) {
      warnings.push('Transaction TTL is not set')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  } catch (error) {
    errors.push(
      `Failed to parse transaction: ${error instanceof Error ? error.message : String(error)}`,
    )
    return {valid: false, errors, warnings}
  }
}

/**
 * Enhanced error for CIP-30 transaction signing
 */
export class CIP30TransactionError extends Error {
  constructor(
    message: string,
    public readonly validation: TransactionValidationResult,
  ) {
    super(message)
    this.name = 'CIP30TransactionError'
  }
}
