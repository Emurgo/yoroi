// @flow

import {BigNumber} from 'bignumber.js'
import {mnemonicToEntropy, generateMnemonic} from 'bip39'
import {HdWallet, Wallet, PasswordProtect} from 'rust-cardano-crypto'
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

export const _result = <T>(rustResult: {
  failed: boolean,
  result: T,
  msg: string,
}): Promise<T> => {
  if (rustResult.failed) return Promise.reject(new CardanoError(rustResult.msg))
  return Promise.resolve(rustResult.result)
}

export const getMasterKeyFromMnemonic = (mnemonic: string) => {
  const entropy = new Buffer(mnemonicToEntropy(mnemonic), 'hex')
  const masterKey = HdWallet.fromEnhancedEntropy(entropy, '')
  return Promise.resolve(masterKey)
}

export const getAccountFromMasterKey = async (
  masterKey: Buffer,
  accountIndex?: number = CONFIG.WALLET.ACCOUNT_INDEX,
  protocolMagic?: number = CONFIG.CARDANO.PROTOCOL_MAGIC,
): Promise<CryptoAccount> => {
  const wallet = await _result(Wallet.fromMasterKey(masterKey))
  wallet.config.protocol_magic = protocolMagic
  return _result(Wallet.newAccount(wallet, accountIndex))
}

export const encryptMasterKey = (
  password: string,
  masterKey: Uint8Array,
): string => {
  assertTrue(password != null)
  const salt = new Buffer(cryptoRandomString(2 * 32), 'hex')
  const nonce = new Buffer(cryptoRandomString(2 * 12), 'hex')
  const formattedPassword: Uint8Array = new TextEncoder().encode(password)
  const encryptedBytes = PasswordProtect.encryptWithPassword(
    formattedPassword,
    salt,
    nonce,
    masterKey,
  )
  const encryptedHex = Buffer.from(encryptedBytes).toString('hex')
  return encryptedHex
}

export const decryptMasterKey = (
  password: string,
  encryptedHex: string,
): Uint8Array => {
  const encryptedBytes = new Buffer(encryptedHex, 'hex')
  const formattedPassword: Uint8Array = new TextEncoder().encode(password)
  // prettier-ignore
  const decryptedBytes:
    | ?Uint8Array
    | false = PasswordProtect.decryptWithPassword(
      formattedPassword,
      encryptedBytes,
    )
  if (!decryptedBytes) {
    throw new CardanoError('Wrong password')
  }

  return decryptedBytes
}

const _getAddresses = (
  account: CryptoAccount,
  type: AddressType,
  indexes: Array<number>,
): Promise<Array<string>> =>
  _result(Wallet.generateAddresses(account, type, indexes))

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
    return await _result(Wallet.checkAddress(getAddressInHex(address)))
  } catch (e) {
    if (e instanceof CardanoError) return false
    throw e
  }
}

export const generateAdaMnemonic = () =>
  generateMnemonic(CONFIG.MNEMONIC_STRENGTH, randomBytes)

export const generateFakeWallet = async () => {
  const fakeMnemonic = generateAdaMnemonic()
  const fakeMasterKey = await getMasterKeyFromMnemonic(fakeMnemonic)
  const wallet = await _result(Wallet.fromMasterKey(fakeMasterKey))
  return wallet
}

export const getWalletFromMasterKey = async (
  masterKey: Uint8Array,
  protocolMagic?: number = CONFIG.CARDANO.PROTOCOL_MAGIC,
) => {
  const wallet = await _result(Wallet.fromMasterKey(masterKey))
  wallet.config.protocol_magic = protocolMagic
  return wallet
}

export const signTransaction = async (
  wallet: any,
  inputs: Array<TransactionInput>,
  outputs: Array<TransactionOutput>,
  changeAddress: string,
) => {
  const result = await _result(
    Wallet.spend(wallet, inputs, outputs, changeAddress),
  )

  return {
    ...result,
    fee: new BigNumber(result.fee, 10),
  }
}
