import {ApiError} from '@yoroi/common'
import {SubmitTxInsufficientCollateralError} from '@yoroi/types'

// Re-export ApiError for convenience
export {ApiError}

// Re-export from centralized error location
export {
  SubmitTxInsufficientCollateralError,
  ApiHistoryError,
} from '@yoroi/types'

/**
 * Error handler for transaction submission errors
 */
export const handleError = (e: Error): Error => {
  if (e.message.includes('InsufficientCollateral')) {
    return new SubmitTxInsufficientCollateralError(e.message)
  }
  return e
}
