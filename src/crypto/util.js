// @flow

import {BigNumber} from 'bignumber.js'
import {mnemonicToEntropy, generateMnemonic} from 'bip39'
import {HdWallet, Wallet, PasswordProtect} from 'react-native-cardano'
import {randomBytes} from 'react-native-randombytes'
import bs58 from 'bs58'
import cryptoRandomString from 'crypto-random-string'

import assert from '../utils/assert'
import {CONFIG} from '../config'
import {
  _rethrow,
  InsufficientFunds,
  WrongPassword,
  CardanoError,
} from './errors'

import type {
  TransactionInput,
  TransactionOutput,
} from '../types/HistoryTransaction'

export type AddressType = 'Internal' | 'External'

export type CryptoAccount = {
  derivation_scheme: string,
  root_cached_key: string,
}

const KNOWN_ERROR_MSG = {
  DECRYPT_FAILED: 'Decryption failed. Check your password.',
  INSUFFICIENT_FUNDS_RE: /NotEnoughInput/,
  SIGN_TX_BUG: /TxBuildError\(CoinError\(Negative\)\)/,
  // over 45000000000000000
  AMOUNT_OVERFLOW1: /Coin of value [0-9]+ is out of bound./,
  // way over 45000000000000000
  AMOUNT_OVERFLOW2: /ParseIntError { kind: Overflow }"/,
  // output sum over 45000000000000000
  AMOUNT_SUM_OVERFLOW: /CoinError\(OutOfBound/,
}

export type EncryptionMethod = 'BIOMETRICS' | 'SYSTEM_PIN' | 'MASTER_PASSWORD'

export const getMasterKeyFromMnemonic = async (mnemonic: string) => {
  const entropy = mnemonicToEntropy(mnemonic)
  const masterKey = await _rethrow(HdWallet.fromEnhancedEntropy(entropy, ''))
  return masterKey
}

export const getAccountFromMasterKey = async (
  masterKey: Buffer,
  accountIndex?: number = CONFIG.WALLET.ACCOUNT_INDEX,
  protocolMagic?: number = CONFIG.CARDANO.PROTOCOL_MAGIC,
): Promise<CryptoAccount> => {
  const wallet = await _rethrow(Wallet.fromMasterKey(masterKey))
  wallet.config.protocol_magic = protocolMagic
  return _rethrow(Wallet.newAccount(wallet, accountIndex))
}

export const encryptData = async (
  plaintextHex: string,
  secretKey: string,
): Promise<string> => {
  assert.assert(!!plaintextHex, 'encrypt:: !!plaintextHex')
  assert.assert(!!secretKey, 'encrypt:: !!secretKey')
  const secretKeyHex = Buffer.from(secretKey, 'utf8').toString('hex')
  const saltHex = cryptoRandomString(2 * 32)
  const nonceHex = cryptoRandomString(2 * 12)
  const ciphertext = await PasswordProtect.encryptWithPassword(
    secretKeyHex,
    saltHex,
    nonceHex,
    plaintextHex,
  )
  return ciphertext
}

export const decryptData = async (
  ciphertext: string,
  secretKey: string,
): Promise<string> => {
  assert.assert(!!ciphertext, 'decrypt:: !!cyphertext')
  assert.assert(!!secretKey, 'decrypt:: !!secretKey')
  const secretKeyHex = Buffer.from(secretKey, 'utf8').toString('hex')
  try {
    return await PasswordProtect.decryptWithPassword(secretKeyHex, ciphertext)
  } catch (e) {
    if (e.message === KNOWN_ERROR_MSG.DECRYPT_FAILED) {
      throw new WrongPassword()
    }
    throw new CardanoError(e.message)
  }
}

export const getAddresses = (
  account: CryptoAccount,
  type: AddressType,
  indexes: Array<number>,
  protocolMagic?: number = CONFIG.CARDANO.PROTOCOL_MAGIC,
): Promise<Array<string>> =>
  _rethrow(Wallet.generateAddresses(account, type, indexes, protocolMagic))

export const ADDRESS_TYPE_TO_CHANGE: {[AddressType]: number} = {
  External: 0,
  Internal: 1,
}

export const getExternalAddresses = (
  account: CryptoAccount,
  indexes: Array<number>,
  protocolMagic?: number = CONFIG.CARDANO.PROTOCOL_MAGIC,
) => getAddresses(account, 'External', indexes, protocolMagic)

export const getInternalAddresses = (
  account: CryptoAccount,
  indexes: Array<number>,
  protocolMagic?: number = CONFIG.CARDANO.PROTOCOL_MAGIC,
) => getAddresses(account, 'Internal', indexes, protocolMagic)

export const getAddressInHex = (address: string): string => {
  try {
    return bs58.decode(address).toString('hex')
  } catch (err) {
    throw new CardanoError(err.message)
  }
}

export const isValidAddress = async (address: string): Promise<boolean> => {
  try {
    return await Wallet.checkAddress(address)
  } catch (e) {
    return false
  }
}

export const generateAdaMnemonic = () =>
  generateMnemonic(CONFIG.MNEMONIC_STRENGTH, randomBytes)

export const generateFakeWallet = async () => {
  const fakeMnemonic = generateAdaMnemonic()
  const fakeMasterKey = await getMasterKeyFromMnemonic(fakeMnemonic)
  const wallet = await _rethrow(Wallet.fromMasterKey(fakeMasterKey))
  return wallet
}

export const getWalletFromMasterKey = async (
  masterKeyHex: string,
  protocolMagic?: number = CONFIG.CARDANO.PROTOCOL_MAGIC,
) => {
  const wallet = await _rethrow(Wallet.fromMasterKey(masterKeyHex))
  wallet.config.protocol_magic = protocolMagic
  return wallet
}

export const signTransaction = async (
  wallet: any,
  inputs: Array<TransactionInput>,
  outputs: Array<TransactionOutput>,
  changeAddress: string,
) => {
  try {
    const result = await Wallet.spend(wallet, inputs, outputs, changeAddress)

    return {
      ...result,
      fee: new BigNumber(result.fee, 10),
    }
  } catch (e) {
    if (KNOWN_ERROR_MSG.INSUFFICIENT_FUNDS_RE.test(e.message)) {
      throw new InsufficientFunds()
    }
    if (KNOWN_ERROR_MSG.SIGN_TX_BUG.test(e.message)) {
      throw new InsufficientFunds()
    }
    // TODO(ppershing): these should be probably tested as a precondition
    // before calling Wallet.spend but I expect some additional corner cases
    if (
      KNOWN_ERROR_MSG.AMOUNT_OVERFLOW1.test(e.message) ||
      KNOWN_ERROR_MSG.AMOUNT_OVERFLOW2.test(e.message) ||
      KNOWN_ERROR_MSG.AMOUNT_SUM_OVERFLOW.test(e.message)
    ) {
      throw new InsufficientFunds()
    }
    throw new CardanoError(e.message)
  }
}

export const formatBIP44 = (
  account: number,
  type: AddressType,
  index: number,
) => {
  const PURPOSE = 44
  const COIN = 1815

  return `m/${PURPOSE}'/${COIN}'/${account}'/${
    ADDRESS_TYPE_TO_CHANGE[type]
  }/${index}`
}
