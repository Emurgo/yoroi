// @flow

import {BigNumber} from 'bignumber.js'
import {mnemonicToEntropy, generateMnemonic} from 'bip39'
import {HdWallet, Wallet, PasswordProtect} from 'react-native-cardano'
import {
  encryptWithPassword as encryptWithPasswordJs,
  decryptWithPassword as decryptWithPasswordJs,
} from 'emip3js'
import {randomBytes} from 'react-native-randombytes'
import bs58 from 'bs58'
import cryptoRandomString from 'crypto-random-string'

import assert from '../../utils/assert'
import {CONFIG} from '../../config/config'
import {
  _rethrow,
  InsufficientFunds,
  WrongPassword,
  CardanoError,
} from '../errors'
import {getCardanoByronConfig} from '../../config/networks'

import type {TransactionInput, TransactionOutput, V1SignedTx} from '../types'
import type {AddressType} from '../commonUtils'

const BYRON_PROTOCOL_MAGIC = getCardanoByronConfig().PROTOCOL_MAGIC

export type CryptoAccount = {
  derivation_scheme: string,
  root_cached_key: string,
}

export const KNOWN_ERROR_MSG = {
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

export const getMasterKeyFromMnemonic = async (mnemonic: string) => {
  const entropy = mnemonicToEntropy(mnemonic)
  const masterKey = await _rethrow(HdWallet.fromEnhancedEntropy(entropy, ''))
  return masterKey
}

export const getAccountFromMasterKey = async (
  masterKey: Buffer,
  accountIndex?: number = CONFIG.NUMBERS.ACCOUNT_INDEX,
  protocolMagic?: number = BYRON_PROTOCOL_MAGIC,
): Promise<CryptoAccount> => {
  const wallet = await _rethrow(Wallet.fromMasterKey(masterKey))
  wallet.config.protocol_magic = protocolMagic
  return _rethrow(Wallet.newAccount(wallet, accountIndex))
}

export const encryptData = async (
  plaintextHex: string,
  secretKey: string,
  useJs?: boolean = false,
): Promise<string> => {
  assert.assert(!!plaintextHex, 'encrypt:: !!plaintextHex')
  assert.assert(!!secretKey, 'encrypt:: !!secretKey')
  const secretKeyHex = Buffer.from(secretKey, 'utf8').toString('hex')
  const saltHex = cryptoRandomString({length: 2 * 32})
  const nonceHex = cryptoRandomString({length: 2 * 12})
  if (useJs) {
    return await encryptWithPasswordJs(
      secretKeyHex,
      saltHex,
      nonceHex,
      plaintextHex,
    )
  }
  return await PasswordProtect.encryptWithPassword(
    secretKeyHex,
    saltHex,
    nonceHex,
    plaintextHex,
  )
}

export const decryptData = async (
  ciphertext: string,
  secretKey: string,
  useJs?: boolean = false,
): Promise<string> => {
  assert.assert(!!ciphertext, 'decrypt:: !!cyphertext')
  assert.assert(!!secretKey, 'decrypt:: !!secretKey')
  const secretKeyHex = Buffer.from(secretKey, 'utf8').toString('hex')
  try {
    if (useJs) {
      return await decryptWithPasswordJs(secretKeyHex, ciphertext)
    }
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
  protocolMagic?: number = BYRON_PROTOCOL_MAGIC,
): Promise<Array<string>> =>
  _rethrow(Wallet.generateAddresses(account, type, indexes, protocolMagic))

export const getAddressesFromMnemonics = async (
  mnemonic: string,
  type: AddressType,
  indexes: Array<number>,
): Promise<Array<string>> => {
  const masterKey = await getMasterKeyFromMnemonic(mnemonic)
  const account = await getAccountFromMasterKey(masterKey)
  return getAddresses(account, type, indexes)
}

export const getExternalAddresses = (
  account: CryptoAccount,
  indexes: Array<number>,
  protocolMagic?: number = BYRON_PROTOCOL_MAGIC,
) => getAddresses(account, 'External', indexes, protocolMagic)

export const getInternalAddresses = (
  account: CryptoAccount,
  indexes: Array<number>,
  protocolMagic?: number = BYRON_PROTOCOL_MAGIC,
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
  protocolMagic?: number = BYRON_PROTOCOL_MAGIC,
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
): Promise<V1SignedTx> => {
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
