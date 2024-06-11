import {App} from '@yoroi/types'
import bs58 from 'bs58'

import {CardanoMobile} from '../../wallets'
import {ADDRESS_TYPE_TO_CHANGE, AddressType} from '../formatPath'
import {generateWalletRootKey} from '../mnemonic'
import {getCardanoByronConfig} from '../networks'
import {NUMBERS} from '../numbers'
import {wrappedCsl} from '../wrappedCsl'

const BYRON_PROTOCOL_MAGIC = getCardanoByronConfig().PROTOCOL_MAGIC

export type CryptoAccount = {
  derivation_scheme: string
  root_cached_key: string
}

/**
 * returns a root key for HD wallets
 */
export const getMasterKeyFromMnemonic = async (mnemonic: string) => {
  const {csl, release} = wrappedCsl()
  const rootKeyPtr = await generateWalletRootKey(mnemonic, csl)
  const rootKey = Buffer.from(await rootKeyPtr.asBytes()).toString('hex')
  release()
  return rootKey
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

export const getExternalAddresses = (
  account: CryptoAccount,
  indexes: Array<number>,
  protocolMagic: number = BYRON_PROTOCOL_MAGIC,
): Promise<Array<string>> => getAddresses(account, 'External', indexes, protocolMagic)

export const getAddressInHex = (address: string): string => {
  try {
    return bs58.decode(address).toString('hex')
  } catch (err) {
    throw new App.Errors.LibraryError((err as Error).message)
  }
}
