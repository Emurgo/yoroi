// @flow
import {BigNumber} from 'bignumber.js'
import {validateMnemonic, wordlists} from 'bip39'
import _ from 'lodash'

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

export const validateAmount = (amount: string): ?AmountValidationErrors => {
  if (!amount) {
    return {amountIsRequired: true}
  }

  if (new BigNumber(amount).isLessThan(0)) {
    return {invalidAmount: INVALID_AMOUNT_CODES.POSITIVE_AMOUNT}
  }

  return null
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
