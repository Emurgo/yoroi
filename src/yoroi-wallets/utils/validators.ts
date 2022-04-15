/* eslint-disable @typescript-eslint/no-explicit-any */
import {Resolution} from '@unstoppabledomains/resolution'
import {validateMnemonic, wordlists} from 'bip39'
import _ from 'lodash'

import assert from '../../legacy/assert'
import type {Token} from '../../legacy/HistoryTransaction'
import {getNetworkConfigById} from '../../legacy/networks'
import {normalizeToAddress} from '../../legacy/utils'
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
  invalidAmount?: typeof InvalidAssetAmount.ERROR_CODES[keyof typeof InvalidAssetAmount.ERROR_CODES]
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

export type InvalidPhraseErrorCode = typeof INVALID_PHRASE_ERROR_CODES[keyof typeof INVALID_PHRASE_ERROR_CODES]
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

export const getUnstoppableDomainAddress = async (domain: string) => {
  try {
    return await new Resolution().addr(domain, 'ADA')
  } catch (e) {
    switch ((e as any).code) {
      case 'UnsupportedDomain':
        throw new Error('{"unsupportedDomain": true}')
      case 'RecordNotFound':
        throw new Error('{"recordNotFound": true}')
      case 'UnregisteredDomain':
        throw new Error('{"unregisteredDomain": true}')
      default:
        throw new Error('{"invalidAddress": true}')
    }
  } // invalid domain
}

export const isReceiverAddressValid = async (
  receiverAddress: string,
  walletNetworkId: number,
): Promise<AddressValidationErrors | void> => {
  if (!receiverAddress) {
    return {addressIsRequired: true}
  }

  const address = await normalizeToAddress(receiverAddress)
  if (!address) {
    return {invalidAddress: true}
  }

  if (walletNetworkId) {
    try {
      const networkConfig: any = getNetworkConfigById(walletNetworkId)
      const configNetworkId = networkConfig.CHAIN_NETWORK_ID && Number(networkConfig.CHAIN_NETWORK_ID)
      const addressNetworkId = await address.networkId()
      if (addressNetworkId !== configNetworkId && !isNaN(configNetworkId)) {
        return {invalidAddress: true}
      }
    } catch (e) {
      // NOTE: should not happen
      return {invalidAddress: true}
    }
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
  assert.assert(word === word.toLowerCase(), 'we expect wordlist to contain only lowercase words')
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

export const validateRecoveryPhrase = (mnemonic: string, mnemonicLength: number) => {
  const cleaned = cleanMnemonic(mnemonic)
  // Deal with edge case ''.split(' ') -> ['']
  const words = cleaned ? cleaned.split(' ') : []

  const tooShort = words.length < mnemonicLength
  const tooLong = words.length > mnemonicLength
  const invalidPhraseErrors: Array<any> = []

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
      lastMightBeUnfinished: isUnknown(_.last(words)) && !mnemonic.endsWith(' '),
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
