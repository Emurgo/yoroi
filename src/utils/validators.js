// @flow
export type PasswordValidationErrors = {
  passwordReq?: boolean,
  passwordConfirmationReq?: boolean,
  matchesConfirmation?: boolean,
}

export const validateWalletName = (walletName: string): boolean => {
  return (walletName.length > 2) && (walletName.length < 41)
}

export const validatePassword = (
  password: string,
  passwordConfirmation: string,
): PasswordValidationErrors | null => {
  let validations = null
  if (!password) {
    validations = {...validations, passwordReq: true}
  }
  if (!passwordConfirmation) {
    validations = {...validations, passwordConfirmationReq: true}
  }
  if (password !== passwordConfirmation) {
    validations = {...validations, matchesConfirmation: true}
  }

  return validations
}
