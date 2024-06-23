import {App} from '@yoroi/types'

import {SubmitTxInsufficientCollateralError} from '../../../yoroi-wallets/cardano/api/errors'

export const getErrorMessage = (
  error: unknown,
  strings: Record<'wrongPasswordMessage' | 'error' | 'missingCollateral', string>,
) => {
  if (error instanceof App.Errors.WrongPassword) {
    return strings.wrongPasswordMessage
  }
  if (error instanceof SubmitTxInsufficientCollateralError) {
    return strings.missingCollateral
  }

  if (error instanceof Error) {
    return error.message
  }

  return strings.error
}
