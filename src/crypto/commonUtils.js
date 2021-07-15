// @flow

/**
 * Utility functions that can be required by different wallet
 * environments. Replaces the old util.js library now moved to Byron/util.js
 * TODO: migrate here common utilities from Byron/util.js
 */

import {BigNumber} from 'bignumber.js'
import {mnemonicToEntropy, generateMnemonic} from 'bip39'
/* eslint-disable camelcase */
import {Bip32PrivateKey, encrypt_with_password, decrypt_with_password} from '@emurgo/react-native-haskell-shelley'
/* eslint-enable camelcase */
import {randomBytes} from 'react-native-randombytes'
import cryptoRandomString from 'crypto-random-string'

import {CONFIG, getWalletConfigById} from '../config/config'
import {DERIVATION_TYPES} from '../config/types'
import {MultiToken, type DefaultTokenEntry} from './MultiToken'
import assert from '../utils/assert'
import {WrongPassword, CardanoError} from './errors'

import type {WalletImplementationId} from '../config/types'
import type {SendTokenList} from './types'

export type AddressType = 'Internal' | 'External'

export const ADDRESS_TYPE_TO_CHANGE: {[AddressType]: number} = {
  External: 0,
  Internal: 1,
}

/**
 * wallet key generation
 */

export const generateAdaMnemonic = () => generateMnemonic(CONFIG.MNEMONIC_STRENGTH, randomBytes)

export const generateWalletRootKey: (mnemonic: string) => Promise<Bip32PrivateKey> = async (mnemonic: string) => {
  const bip39entropy = mnemonicToEntropy(mnemonic)
  const EMPTY_PASSWORD = Buffer.from('')
  const rootKey = await Bip32PrivateKey.from_bip39_entropy(Buffer.from(bip39entropy, 'hex'), EMPTY_PASSWORD)
  return rootKey
}

/**
 * encryption/decryption
 */

export const encryptData = async (plaintextHex: string, secretKey: string): Promise<string> => {
  assert.assert(!!plaintextHex, 'encrypt:: !!plaintextHex')
  assert.assert(!!secretKey, 'encrypt:: !!secretKey')
  const secretKeyHex = Buffer.from(secretKey, 'utf8').toString('hex')
  const saltHex = cryptoRandomString({length: 2 * 32})
  const nonceHex = cryptoRandomString({length: 2 * 12})
  return await encrypt_with_password(secretKeyHex, saltHex, nonceHex, plaintextHex)
}

export const decryptData = async (ciphertext: string, secretKey: string): Promise<string> => {
  assert.assert(!!ciphertext, 'decrypt:: !!cyphertext')
  assert.assert(!!secretKey, 'decrypt:: !!secretKey')
  const secretKeyHex = Buffer.from(secretKey, 'utf8').toString('hex')
  try {
    return await decrypt_with_password(secretKeyHex, ciphertext)
  } catch (e) {
    if (String(e) === 'Decryption error') {
      throw new WrongPassword()
    }
    // note: JS error from rust doesn't set e.message
    throw new CardanoError(String(e))
  }
}

export const formatPath = (
  account: number,
  type: AddressType,
  index: number,
  walletImplementationId: WalletImplementationId,
) => {
  const HARD_DERIVATION_START = CONFIG.NUMBERS.HARD_DERIVATION_START
  const walletConfig = getWalletConfigById(walletImplementationId)
  let purpose
  if (walletConfig.TYPE === DERIVATION_TYPES.BIP44) {
    purpose = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44
  } else if (walletConfig.TYPE === DERIVATION_TYPES.CIP1852) {
    purpose = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852
  } else {
    throw new Error('Unknown wallet purpose')
  }
  purpose = purpose - HARD_DERIVATION_START

  const COIN = CONFIG.NUMBERS.COIN_TYPES.CARDANO - HARD_DERIVATION_START

  return `m/${purpose}'/${COIN}'/${account}'/${ADDRESS_TYPE_TO_CHANGE[type]}/${index}`
}

export const hasSendAllDefault = (tokens: SendTokenList): boolean => {
  const defaultSendAll = tokens.find((token) => {
    if (token.shouldSendAll === true && token.token.isDefault) return true
    return false
  })
  return defaultSendAll != null
}

/**
 * Construct the list of what will be included in the tx output
 */
export const builtSendTokenList = (
  defaultToken: DefaultTokenEntry,
  tokens: SendTokenList,
  utxos: Array<MultiToken>,
): MultiToken => {
  const amount = new MultiToken([], defaultToken)

  for (const token of tokens) {
    if (token.amount != null) {
      // if we add a specific amount of a specific token to the output, just add it
      amount.add({
        amount: new BigNumber(token.amount),
        identifier: token.token.identifier,
        networkId: token.token.networkId,
      })
    } else if (token.token.isDefault) {
      // if we add a non-specific amount of the default token
      // sum amount values in the UTXO
      const relatedUtxoSum = utxos.reduce((value, next) => value.plus(next.getDefaultEntry().amount), new BigNumber(0))
      amount.add({
        amount: relatedUtxoSum,
        identifier: token.token.identifier,
        networkId: token.token.networkId,
      })
    } else {
      // if we add a non-specific amount of a given token
      // sum up the value of all our UTXOs with this token
      const relatedUtxoSum = utxos.reduce((value, next) => {
        const assetEntry = next.nonDefaultEntries().find((entry) => entry.identifier === token.token.identifier)
        if (assetEntry != null) {
          return value.plus(assetEntry.amount)
        }
        return value
      }, new BigNumber(0))
      amount.add({
        amount: relatedUtxoSum,
        identifier: token.token.identifier,
        networkId: token.token.networkId,
      })
    }
  }
  return amount
}
