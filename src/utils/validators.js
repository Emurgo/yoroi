// @flow
import {BigNumber} from 'bignumber.js'
import {isValidAddress} from '../crypto/util'

export type PasswordValidationErrors = {
  passwordReq?: boolean,
  passwordConfirmationReq?: boolean,
  matchesConfirmation?: boolean,
}

export type WalletNameValidationErrors = {
  walletNameLength?: boolean,
}

export type AddressValidationErrors = {
  addressIsRequired?: boolean,
  invalidAddress?: boolean,
}

export const INVALID_AMOUNT_CODES = {
  POSITIVE_AMOUNT: 'positiveAmount',
  INSUFFICIENT_BALANCE: 'insufficientBalance',
}

export type AmountValidationCode = $Values<typeof INVALID_AMOUNT_CODES>
export type AmountValidationErrors = {
  amountIsRequired?: boolean,
  invalidAmount?: AmountValidationCode,
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

export const validateWalletName = (
  walletName: string,
): WalletNameValidationErrors | null => {
  let validations = null
  if (walletName.length < 3 || walletName.length > 40) {
    validations = {walletNameLength: true}
  }

  return validations
}

export const validateAddressAsync = async (
  address: string,
): Promise<?AddressValidationErrors> => {
  if (!address) {
    return {addressIsRequired: true}
  }

  const isValid = await isValidAddress(address)
  return isValid ? null : {invalidAddress: true}
}

export const validateAmount = (value: string): ?AmountValidationErrors => {
  if (!value) {
    return {amountIsRequired: true}
  }

  const amount = new BigNumber(value, 10)
  if (amount.isNaN() || amount.isLessThan(0)) {
    return {invalidAmount: INVALID_AMOUNT_CODES.POSITIVE_AMOUNT}
  }

  return null
}
