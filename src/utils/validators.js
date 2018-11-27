// @flow
import {BigNumber} from 'bignumber.js'
import {validateMnemonic, wordlists} from 'bip39'
import _ from 'lodash'

import {containsUpperCase, containsLowerCase, isNumeric} from '../utils/string'
import {CONFIG} from '../config'
import {isValidAddress} from '../crypto/util'

export type PasswordValidationErrors = {
  passwordReq?: boolean,
  passwordConfirmationReq?: boolean,
  matchesConfirmation?: boolean,
  passwordIsWeak?: boolean,
}

export type WalletNameValidationErrors = {
  walletNameLength?: boolean,
}

export type AddressValidationErrors = {
  addressIsRequired?: boolean,
  invalidAddress?: boolean,
}

export type AmountValidationErrors = {
  amountIsRequired?: boolean,
  invalidAmount?: boolean,
}

export type BalanceValidationErrors = {
  insufficientBalance?: boolean,
}

export const INVALID_PHRASE_ERROR_CODES = {
  MAX_LENGTH: 'MAX_LENGTH',
  UNKNOWN_WORDS: 'UNKNOWN_WORDS',
  INVALID_CHECKSUM: 'INVALID_CHECKSUM',
}

export type InvalidPhraseErrorCode = $Values<typeof INVALID_PHRASE_ERROR_CODES>
export type InvalidPhraseError = {
  code: InvalidPhraseErrorCode,
  parameter: any,
}

export type RecoveryPhraseErrors = {
  invalidPhrase: Array<InvalidPhraseError>,
  minLength?: boolean,
}

export type PasswordStrength = {
  isStrong: boolean,
  hasSevenCharacters?: boolean,
  hasUppercase?: boolean,
  hasLowercase?: boolean,
  hasDigit?: boolean,
  hasTwelveCharacters?: boolean,
}

export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return {isStrong: false}
  }

  if (password.length >= 12) {
    return {isStrong: true, hasTwelveCharacters: true}
  } else if (!CONFIG.ALLOW_SHORT_PASSWORD) {
    return {isStrong: false}
  }

  const validation = {
    hasSevenCharacters: password.length >= 7,
    hasUppercase: containsUpperCase(password),
    hasLowercase: containsLowerCase(password),
    hasDigit: password.split('').some(isNumeric),
  }

  return {...validation, isStrong: Object.values(validation).every((x) => x)}
}

export const validatePassword = (
  password: string,
  passwordConfirmation: string,
): PasswordValidationErrors => {
  let validations = {}
  if (!password) {
    validations = {...validations, passwordReq: true}
  }
  if (!passwordConfirmation) {
    validations = {...validations, passwordConfirmationReq: true}
  }
  if (password !== passwordConfirmation) {
    validations = {...validations, matchesConfirmation: true}
  }
  if (!getPasswordStrength(password).isStrong) {
    validations = {...validations, passwordIsWeak: true}
  }

  return validations
}

export const validateWalletName = (
  walletName: string,
): WalletNameValidationErrors | null => {
  let validations = null
  if (walletName.length < 1 || walletName.length > 40) {
    validations = {walletNameLength: true}
  }

  return validations
}

export const validateAddressAsync = async (
  address: string,
): Promise<AddressValidationErrors> => {
  if (!address) {
    return {addressIsRequired: true}
  }

  const isValid = await isValidAddress(address)
  return isValid ? {} : {invalidAddress: true}
}

const MAX_DECIMAL_DIGITS = 6

export const validateAmount = (value: string): AmountValidationErrors => {
  if (!value) {
    return {amountIsRequired: true}
  }

  const amount = new BigNumber(value, 10)
  if (
    amount.isNaN() ||
    amount.isLessThan(0) ||
    amount.decimalPlaces() > MAX_DECIMAL_DIGITS
  ) {
    return {invalidAmount: true}
  }

  return {}
}

const MNEMONIC_LENGTH = 15

export const validateRecoveryPhrase = (phrase: string) => {
  const words = phrase.split(' ').filter((word) => !!word)
  const minLength = words.length < MNEMONIC_LENGTH

  const invalidPhraseErrors = []
  const maxLength = words.length > MNEMONIC_LENGTH
  if (maxLength) {
    invalidPhraseErrors.push({code: INVALID_PHRASE_ERROR_CODES.MAX_LENGTH})
  }

  const notInWordlist = (word) => !wordlists.EN.includes(word)
  const unknownWords: Array<string> = minLength
    ? _.initial(words).filter(notInWordlist)
    : words.filter(notInWordlist)
  if (unknownWords.length > 0) {
    invalidPhraseErrors.push({
      code: INVALID_PHRASE_ERROR_CODES.UNKNOWN_WORDS,
      parameter: unknownWords,
    })
  }

  if (minLength || invalidPhraseErrors.length > 0) {
    return {
      minLength,
      invalidPhrase:
        invalidPhraseErrors.length > 0 ? invalidPhraseErrors : null,
    }
  } else if (!validateMnemonic(phrase)) {
    return {
      invalidPhrase: [{code: INVALID_PHRASE_ERROR_CODES.INVALID_CHECKSUM}],
    }
  } else {
    return null
  }
}
