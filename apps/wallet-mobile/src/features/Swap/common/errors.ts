import {SubmitTxInsufficientCollateralError} from '../../../yoroi-wallets/cardano/api/errors'
import {WrongPassword} from '../../../yoroi-wallets/cardano/errors'

export const getErrorMessage = (
  error: unknown,
  strings: Record<'wrongPasswordMessage' | 'error' | 'missingCollateral', string>,
) => {
  if (error instanceof WrongPassword) {
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
