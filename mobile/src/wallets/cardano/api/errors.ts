export class SubmitTxInsufficientCollateralError extends Error {}

export const handleError = (e: Error) => {
  if (e.message.includes('InsufficientCollateral')) {
    return new SubmitTxInsufficientCollateralError(e.message)
  }
  return e
}
