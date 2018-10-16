// @flow

import {mnemonicToEntropy, generateMnemonic} from 'bip39'
import {HdWallet, Wallet} from 'rust-cardano-crypto'
import {randomBytes} from 'react-native-randombytes'
import ExtendableError from 'es6-error'
import bs58 from 'bs58'

import {CONFIG} from '../config'

export type AddressType = 'Internal' | 'External'
export type Account = {
  root_cached_key: string,
  derivation_scheme: string
}

export class CardanoError extends ExtendableError {
}

export const _result = <T>(rustResult: {failed: boolean, result: T, msg: string}): T => {
  if (rustResult.failed) throw new CardanoError(rustResult.msg)
  return rustResult.result
}

export const getMasterKeyFromMnemonic = (mnemonic: string) => {
  const entropy = new Buffer(mnemonicToEntropy(mnemonic), 'hex')
  const masterKey = HdWallet.fromEnhancedEntropy(entropy, '')
  return masterKey
}

export const getAccountFromMasterKey = (
  masterKey: Buffer,
  magic: number = CONFIG.CARDANO.PROTOCOL_MAGIC
) => {
  const wallet = _result(Wallet.fromMasterKey(masterKey))
  wallet.config.protocol_magic = magic
  return _result(Wallet.newAccount(wallet, 0))
}

export const getExternalAddresses = (account: Account, indexes: Array<number>) =>
  _result(Wallet.generateAddresses(account, 'External', indexes))

export const getInternalAddresses = (account: Account, indexes: Array<number>) =>
  _result(Wallet.generateAddresses(account, 'Internal', indexes))

export const getAddressInHex = (address: string): string => {
  try {
    return bs58.decode(address).toString('hex')
  } catch (err) {
    throw new CardanoError(err.message)
  }
}

export const isValidAddress = (address: string): boolean => {
  try {
    return _result(Wallet.checkAddress(getAddressInHex(address)))
  } catch (e) {
    if (e instanceof CardanoError) return false
    throw e
  }
}

export const generateAdaMnemonic = () => generateMnemonic(CONFIG.MNEMONIC_STRENGTH, randomBytes)
