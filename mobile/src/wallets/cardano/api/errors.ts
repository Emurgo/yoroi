import {SubmitTxInsufficientCollateralError} from '@yoroi/types'

// Re-export from centralized error location
export {SubmitTxInsufficientCollateralError}

export const handleError = (e: Error) => {
  if (e.message.includes('InsufficientCollateral')) {
    return new SubmitTxInsufficientCollateralError(e.message)
  }
  return e
}
