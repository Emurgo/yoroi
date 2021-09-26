// @flow

import {ByronAddress, Bip32PrivateKey, Bip32PublicKey} from '@emurgo/react-native-haskell-shelley'
import bs58 from 'bs58'

import {generateWalletRootKey, ADDRESS_TYPE_TO_CHANGE} from '../commonUtils'
import {CONFIG} from '../../config/config'
import {CardanoError} from '../errors'
import {getCardanoByronConfig} from '../../config/networks'

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

/**
 * returns a root key for HD wallets
 */
export const getMasterKeyFromMnemonic = async (mnemonic: string) => {
  const masterKeyPtr = await generateWalletRootKey(mnemonic)
  return Buffer.from(await masterKeyPtr.as_bytes()).toString('hex')
}

/**
 * returns an account-level public key in the legacy Byron path and in the
 * old CryptoAccount format
 */
export const getAccountFromMasterKey = async (
  masterKey: string,
  accountIndex?: number = CONFIG.NUMBERS.ACCOUNT_INDEX,
): Promise<CryptoAccount> => {
  const masterKeyPtr = await Bip32PrivateKey.from_bytes(Buffer.from(masterKey, 'hex'))
  const accountKey = await (
    await (
      await masterKeyPtr.derive(CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44)
    ).derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO)
  ).derive(accountIndex + CONFIG.NUMBERS.HARD_DERIVATION_START)
  const accountPubKey = await accountKey.to_public()
  // match old byron CryptoAccount type
  return {
    root_cached_key: Buffer.from(await accountPubKey.as_bytes(), 'hex').toString('hex'),
    derivation_scheme: 'V2',
  }
}

/**
 * Generates Byron-era (aka Icarus) addresses from an account-level
 * BIP32 public key. This key should have been generated following the
 * Byron-era path (ie. using the BIP44 purpose)
 */
export const getAddresses = async (
  account: CryptoAccount,
  type: AddressType,
  indexes: Array<number>,
  protocolMagic?: number = BYRON_PROTOCOL_MAGIC,
): Promise<Array<string>> => {
  const addrs = []
  const chainKeyPtr = await (
    await Bip32PublicKey.from_bytes(Buffer.from(account.root_cached_key, 'hex'))
  ).derive(ADDRESS_TYPE_TO_CHANGE[type])
  for (const i of indexes) {
    const byronAddr = await ByronAddress.icarus_from_key(await chainKeyPtr.derive(i), protocolMagic)
    const byronAddrBs58 = await byronAddr.to_base58()
    addrs.push(byronAddrBs58)
  }
  return addrs
}

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
): Promise<Array<string>> => getAddresses(account, 'External', indexes, protocolMagic)

export const getInternalAddresses = (
  account: CryptoAccount,
  indexes: Array<number>,
  protocolMagic?: number = BYRON_PROTOCOL_MAGIC,
): Promise<Array<string>> => getAddresses(account, 'Internal', indexes, protocolMagic)

export const getAddressInHex = (address: string): string => {
  try {
    return bs58.decode(address).toString('hex')
  } catch (err) {
    throw new CardanoError(err.message)
  }
}
