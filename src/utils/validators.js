// @flow
import {validateMnemonic, wordlists} from 'bip39'
import _ from 'lodash'

import {normalizeToAddress} from '../crypto/shelley/utils'
import assert from '../utils/assert'
import {parseAdaDecimal, InvalidAdaAmount} from '../utils/parsing'

export type PasswordValidationErrors = {|
  passwordReq?: boolean,
  passwordConfirmationReq?: boolean,
  matchesConfirmation?: boolean,
  passwordIsWeak?: boolean,
|}

export type WalletNameValidationErrors = {|
  tooLong?: boolean,
  nameAlreadyTaken?: boolean,
  mustBeFilled?: boolean,
|}

export type AddressValidationErrors = {|
  addressIsRequired?: boolean,
  invalidAddress?: boolean,
|}

export type AmountValidationErrors = {|
  amountIsRequired?: boolean,
  invalidAmount?: $Values<typeof InvalidAdaAmount.ERROR_CODES>,
|}

export type BalanceValidationErrors = {|
  insufficientBalance?: boolean,
|}

export const INVALID_PHRASE_ERROR_CODES = {
  TOO_LONG: 'TOO_LONG',
  TOO_SHORT: 'TOO_SHORT',
  UNKNOWN_WORDS: 'UNKNOWN_WORDS',
  INVALID_CHECKSUM: 'INVALID_CHECKSUM',
}

export type InvalidPhraseErrorCode = $Values<typeof INVALID_PHRASE_ERROR_CODES>
export type InvalidPhraseError =
  | {
      code: 'TOO_LONG' | 'TOO_SHORT' | 'INVALID_CHECKSUM',
    }
  | {
      code: 'UNKNOWN_WORDS',
      words: Array<string>,
      lastMightBeUnfinished: boolean,
    }

export type RecoveryPhraseErrors = {
  invalidPhrase: Array<InvalidPhraseError>,
  minLength?: boolean,
}

export type PasswordStrength = {|
  isStrong: boolean,
  satisfiesPasswordRequirement?: boolean,
|}

const pickOnlyFailingValidations = (validation: Object) => _.pickBy(validation)

export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return {isStrong: false}
  }

  if (password.length >= 10) {
    return {isStrong: true, satisfiesPasswordRequirement: true}
  }

  return {isStrong: false}
}

export const validatePassword = (
  password: string,
  passwordConfirmation: string,
): PasswordValidationErrors =>
  pickOnlyFailingValidations({
    passwordReq: !password,
    passwordConfirmationReq: !passwordConfirmation,
    matchesConfirmation: password !== passwordConfirmation,
    passwordIsWeak: !getPasswordStrength(password).isStrong,
  })

export const validateWalletName = (
  newWalletName: string,
  oldWalletName: ?string,
  walletNames: Array<string>,
): WalletNameValidationErrors =>
  pickOnlyFailingValidations({
    mustBeFilled: !newWalletName,
    tooLong: newWalletName.length > 40,
    nameAlreadyTaken:
      newWalletName !== oldWalletName &&
      walletNames.some((x) => newWalletName === x),
  })

export const getWalletNameError = (
  translations: {
    tooLong: string,
    nameAlreadyTaken: string,
  },
  validationErrors: WalletNameValidationErrors,
) => {
  const {tooLong, nameAlreadyTaken} = translations

  if (validationErrors.tooLong != null) {
    return tooLong
  } else if (validationErrors.nameAlreadyTaken != null) {
    return nameAlreadyTaken
  } else {
    return null
  }
}

export const validateAddressAsync = async (
  address: string,
): Promise<AddressValidationErrors> => {
  if (!address) {
    return {addressIsRequired: true}
  }

  const isValid = await normalizeToAddress(address)
  return isValid != null ? Object.freeze({}) : {invalidAddress: true}
}

export const validateAmount = (value: string): AmountValidationErrors => {
  if (!value) {
    return {amountIsRequired: true}
  }

  try {
    parseAdaDecimal(value)
    return Object.freeze({})
  } catch (e) {
    if (e instanceof InvalidAdaAmount) {
      return {invalidAmount: e.errorCode}
    }
    throw e
  }
}

wordlists.EN.forEach((word) => {
  assert.assert(
    word === word.toLowerCase(),
    'we expect wordlist to contain only lowercase words',
  )
})

const MNEMONIC_LENGTH = 15

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

export const validateRecoveryPhrase = (mnemonic: string) => {
  const cleaned = cleanMnemonic(mnemonic)
  // Deal with edge case ''.split(' ') -> ['']
  const words = cleaned ? cleaned.split(' ') : []

  const tooShort = words.length < MNEMONIC_LENGTH
  const tooLong = words.length > MNEMONIC_LENGTH
  const invalidPhraseErrors = []

  if (tooLong) {
    invalidPhraseErrors.push({code: INVALID_PHRASE_ERROR_CODES.TOO_LONG})
  }

  if (tooShort) {
    invalidPhraseErrors.push({code: INVALID_PHRASE_ERROR_CODES.TOO_SHORT})
  }

  const isUnknown = (word) => !wordlists.EN.includes(word)

  const unknownWords: Array<string> = words.filter(isUnknown)

  if (unknownWords.length > 0) {
    invalidPhraseErrors.push({
      code: INVALID_PHRASE_ERROR_CODES.UNKNOWN_WORDS,
      words: unknownWords,
      lastMightBeUnfinished:
        isUnknown(_.last(words)) && !mnemonic.endsWith(' '),
    })
  }

  if (invalidPhraseErrors.length > 0) {
    return {
      invalidPhrase: invalidPhraseErrors,
    }
  } else if (!validateMnemonic(cleaned)) {
    return {
      invalidPhrase: [{code: INVALID_PHRASE_ERROR_CODES.INVALID_CHECKSUM}],
    }
  } else {
    return {}
  }
}
