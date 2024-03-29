import bs58 from 'bs58'

import {CardanoMobile} from '../../wallets'
import {CardanoError} from '../errors'
import {ADDRESS_TYPE_TO_CHANGE, AddressType} from '../formatPath'
import {generateWalletRootKey} from '../mnemonic'
import {getCardanoByronConfig} from '../networks'
import {NUMBERS} from '../numbers'

const BYRON_PROTOCOL_MAGIC = getCardanoByronConfig().PROTOCOL_MAGIC

export type CryptoAccount = {
  derivation_scheme: string
  root_cached_key: string
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
  const rootKeyPtr = await generateWalletRootKey(mnemonic)
  return Buffer.from(await rootKeyPtr.asBytes()).toString('hex')
}

/**
 * returns an account-level public key in the legacy Byron path and in the
 * old CryptoAccount format
 */
export const getAccountFromMasterKey = async (
  rootKey: string,
  accountIndex: number = NUMBERS.ACCOUNT_INDEX,
): Promise<CryptoAccount> => {
  const rootKeyPtr = await CardanoMobile.Bip32PrivateKey.fromBytes(Buffer.from(rootKey, 'hex'))
  const accountKey = await (
    await (await rootKeyPtr.derive(NUMBERS.WALLET_TYPE_PURPOSE.BIP44)).derive(NUMBERS.COIN_TYPES.CARDANO)
  ).derive(accountIndex + NUMBERS.HARD_DERIVATION_START)
  const accountPubKey = await accountKey.toPublic()
  // match old byron CryptoAccount type
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    root_cached_key: Buffer.from((await accountPubKey.asBytes()) as any, 'hex').toString('hex'),
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
  protocolMagic: number = BYRON_PROTOCOL_MAGIC,
): Promise<Array<string>> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addrs: Array<any> = []
  const chainKeyPtr = await (
    await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(account.root_cached_key, 'hex'))
  ).derive(ADDRESS_TYPE_TO_CHANGE[type])
  for (const i of indexes) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const byronAddr = await CardanoMobile.ByronAddress.icarusFromKey(await chainKeyPtr.derive(i), protocolMagic)
    const byronAddrBs58 = await byronAddr.toBase58()
    addrs.push(byronAddrBs58)
  }
  return addrs
}

export const getAddressesFromMnemonics = async (
  mnemonic: string,
  type: AddressType,
  indexes: Array<number>,
): Promise<Array<string>> => {
  const rootKey = await getMasterKeyFromMnemonic(mnemonic)
  const account = await getAccountFromMasterKey(rootKey)
  return getAddresses(account, type, indexes)
}

export const getExternalAddresses = (
  account: CryptoAccount,
  indexes: Array<number>,
  protocolMagic: number = BYRON_PROTOCOL_MAGIC,
): Promise<Array<string>> => getAddresses(account, 'External', indexes, protocolMagic)

export const getInternalAddresses = (
  account: CryptoAccount,
  indexes: Array<number>,
  protocolMagic: number = BYRON_PROTOCOL_MAGIC,
): Promise<Array<string>> => getAddresses(account, 'Internal', indexes, protocolMagic)

export const getAddressInHex = (address: string): string => {
  try {
    return bs58.decode(address).toString('hex')
  } catch (err) {
    throw new CardanoError((err as Error).message)
  }
}
