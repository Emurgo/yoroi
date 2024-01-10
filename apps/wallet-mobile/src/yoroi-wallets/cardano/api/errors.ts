import ExtendableError from 'es6-error'

export class SubmitTxInsufficientCollateralError extends ExtendableError {}

export const handleError = (e: Error) => {
  if (e.message.includes('InsufficientCollateral')) {
    return new SubmitTxInsufficientCollateralError(e.message)
  }
  return e
}
