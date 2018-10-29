// @flow

import {BigNumber} from 'bignumber.js'
import {mnemonicToEntropy, generateMnemonic} from 'bip39'
import {HdWallet, Wallet, PasswordProtect} from 'react-native-cardano'
import {randomBytes} from 'react-native-randombytes'
import ExtendableError from 'es6-error'
import bs58 from 'bs58'
import cryptoRandomString from 'crypto-random-string'
import {assertTrue} from '../utils/assert'
import {CONFIG} from '../config'

import type {
  TransactionInput,
  TransactionOutput,
} from '../types/HistoryTransaction'

export type AddressType = 'Internal' | 'External'

export type CryptoAccount = {
  root_cached_key: string,
  derivation_scheme: string,
}

export class CardanoError extends ExtendableError {}

export const _rethrow = <T>(x: Promise<T>): Promise<T> =>
  x.catch((e) => {
    throw new CardanoError(e)
  })

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

export const encryptMasterKey = async (
  password: string,
  masterKeyHex: string,
): Promise<string> => {
  assertTrue(password != null)
  const saltHex = cryptoRandomString(2 * 32)
  const nonceHex = cryptoRandomString(2 * 12)
  const encryptedHex = await PasswordProtect.encryptWithPassword(
    password,
    saltHex,
    nonceHex,
    masterKeyHex,
  )
  return encryptedHex
}

export const decryptMasterKey = async (
  password: string,
  encryptedHex: string,
): Promise<string> => {
  const decryptedBytesHex: string = await _rethrow(
    PasswordProtect.decryptWithPassword(password, encryptedHex),
  )
  if (!decryptedBytesHex) {
    throw new CardanoError('Wrong password')
  }

  return decryptedBytesHex
}

const _getAddresses = (
  account: CryptoAccount,
  type: AddressType,
  indexes: Array<number>,
): Promise<Array<string>> =>
  _rethrow(Wallet.generateAddresses(account, type, indexes))

export function getAddressTypeIndex(addressType: AddressType): number {
  if (addressType === 'External') return 0
  if (addressType === 'Internal') return 1

  throw new CardanoError(`Unknown address type: ${addressType}`)
}

export const getExternalAddresses = (
  account: CryptoAccount,
  indexes: Array<number>,
) => _getAddresses(account, 'External', indexes)

export const getInternalAddresses = (
  account: CryptoAccount,
  indexes: Array<number>,
) => _getAddresses(account, 'Internal', indexes)

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
  const wallet = await Wallet.fromMasterKey(masterKeyHex)
  wallet.config.protocol_magic = protocolMagic
  return wallet
}

export const signTransaction = async (
  wallet: any,
  inputs: Array<TransactionInput>,
  outputs: Array<TransactionOutput>,
  changeAddress: string,
) => {
  const result = await _rethrow(
    Wallet.spend(wallet, inputs, outputs, changeAddress),
  )

  return {
    ...result,
    fee: new BigNumber(result.fee, 10),
  }
}
