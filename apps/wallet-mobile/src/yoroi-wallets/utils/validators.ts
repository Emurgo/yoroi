/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'assert'
import {wordlists} from 'bip39'
import _ from 'lodash'

import {Token} from '../types'
import {InvalidAssetAmount, parseAmountDecimal} from './parsing'

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

export type AddressValidationErrors = {
  addressIsRequired?: boolean
  invalidAddress?: boolean
  unsupportedDomain?: boolean
  recordNotFound?: boolean
  unregisteredDomain?: boolean
}

export type AmountValidationErrors = {
  amountIsRequired?: boolean
  invalidAmount?: (typeof InvalidAssetAmount.ERROR_CODES)[keyof typeof InvalidAssetAmount.ERROR_CODES]
}

export type BalanceValidationErrors = {
  insufficientBalance?: boolean
  assetOverflow?: boolean
}

export const INVALID_PHRASE_ERROR_CODES = {
  TOO_LONG: 'TOO_LONG',
  TOO_SHORT: 'TOO_SHORT',
  UNKNOWN_WORDS: 'UNKNOWN_WORDS',
  INVALID_CHECKSUM: 'INVALID_CHECKSUM',
}

export type InvalidPhraseErrorCode = (typeof INVALID_PHRASE_ERROR_CODES)[keyof typeof INVALID_PHRASE_ERROR_CODES]
export type InvalidPhraseError =
  | {
      code: 'TOO_LONG' | 'TOO_SHORT' | 'INVALID_CHECKSUM'
    }
  | {
      code: 'UNKNOWN_WORDS'
      words: Array<string>
      lastMightBeUnfinished: boolean
    }

export type RecoveryPhraseErrors = {
  invalidPhrase: Array<InvalidPhraseError>
  minLength?: boolean
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
  validationErrors: WalletNameValidationErrors,
) => {
  const {tooLong, nameAlreadyTaken, mustBeFilled} = translations

  if (validationErrors.tooLong != null) {
    return tooLong
  } else if (validationErrors.nameAlreadyTaken != null) {
    return nameAlreadyTaken
  } else if (validationErrors.mustBeFilled != null) {
    return mustBeFilled
  } else {
    return null
  }
}

export const validateAmount = (value: string, token: Token): AmountValidationErrors => {
  if (!value) {
    return {amountIsRequired: true}
  }

  try {
    parseAmountDecimal(value, token)
    return Object.freeze({})
  } catch (e) {
    if (e instanceof InvalidAssetAmount) {
      return {invalidAmount: (e as any).errorCode}
    }
    throw e
  }
}

wordlists.EN.forEach((word) => {
  assert(word === word.toLowerCase(), 'we expect wordlist to contain only lowercase words')
})

export const cleanMnemonic = (mnemonic: string) => {
  // get rid of common punctuation
  mnemonic = mnemonic.replace(/[.,?]/g, ' ')
  // normalize whitespace
  mnemonic = mnemonic.replace(/\s+/g, ' ')
  // dictionary does not contain uppercase characters
  mnemonic = mnemonic.toLowerCase()
  // remove leading/trailing whitespace
  return mnemonic.trim()
}
