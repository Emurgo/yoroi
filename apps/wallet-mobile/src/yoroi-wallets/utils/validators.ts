import _ from 'lodash'

export type PasswordValidationErrors = {
  passwordReq?: boolean
  passwordConfirmationReq?: boolean
  matchesConfirmation?: boolean
  passwordIsWeak?: boolean
}

export type WalletNameValidationErrors = {
  tooLong?: boolean
  nameAlreadyTaken?: boolean
  mustBeFilled?: boolean
}

export type PasswordStrength = {
  isStrong: boolean
  satisfiesPasswordRequirement?: boolean
}

const pickOnlyFailingValidations = (validation: Record<string, unknown>) => _.pickBy(validation)

export const REQUIRED_PASSWORD_LENGTH = 10

export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return {isStrong: false}
  }

  if (password.length >= REQUIRED_PASSWORD_LENGTH) {
    return {isStrong: true, satisfiesPasswordRequirement: true}
  }

  return {isStrong: false}
}

export const validatePassword = (password: string, passwordConfirmation: string): PasswordValidationErrors =>
  pickOnlyFailingValidations({
    passwordReq: !password,
    passwordConfirmationReq: !passwordConfirmation,
    matchesConfirmation: password !== passwordConfirmation,
    passwordIsWeak: !getPasswordStrength(password).isStrong,
  })

export const validateWalletName = (
  newWalletName: string,
  oldWalletName: null | string,
  walletNames: Array<string>,
): WalletNameValidationErrors =>
  pickOnlyFailingValidations({
    mustBeFilled: !newWalletName,
    tooLong: newWalletName.length > 40,
    nameAlreadyTaken: newWalletName !== oldWalletName && walletNames.some((x) => newWalletName === x),
  })

export const getWalletNameError = (
  translations: {
    tooLong: string
    nameAlreadyTaken: string
    mustBeFilled?: string
  },
  validationErrors?: WalletNameValidationErrors | null,
) => {
  const {tooLong, nameAlreadyTaken, mustBeFilled} = translations

  if (validationErrors?.tooLong != null) {
    return tooLong
  } else if (validationErrors?.nameAlreadyTaken != null) {
    return nameAlreadyTaken
  } else if (validationErrors?.mustBeFilled != null) {
    return mustBeFilled
  } else {
    return null
  }
}
