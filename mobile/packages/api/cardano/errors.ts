import {ApiError} from '@yoroi/common'

// Re-export ApiError for convenience
export {ApiError}

/**
 * Error thrown when transaction submission fails due to insufficient collateral
 */
export class SubmitTxInsufficientCollateralError extends Error {}

/**
 * Error handler for transaction submission errors
 */
export const handleError = (e: Error): Error => {
  if (e.message.includes('InsufficientCollateral')) {
    return new SubmitTxInsufficientCollateralError(e.message)
  }
  return e
}

/**
 * Error thrown by the backend after a rollback
 * Contains specific error codes for transaction history issues
 */
export class ApiHistoryError extends ApiError {
  public static readonly errors = {
    REFERENCE_TX_NOT_FOUND: 'REFERENCE_TX_NOT_FOUND',
    REFERENCE_BLOCK_MISMATCH: 'REFERENCE_BLOCK_MISMATCH',
    REFERENCE_BEST_BLOCK_MISMATCH: 'REFERENCE_BEST_BLOCK_MISMATCH',
  } as const

  public values: {response: string | null} = {response: null}

  constructor(response: string | null) {
    super(`API history error: ${response}`)
    this.values = {response}
  }
}
