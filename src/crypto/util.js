// @flow

import {mnemonicToEntropy, generateMnemonic} from 'bip39'
import {HdWallet, Wallet} from 'rust-cardano-crypto'
import {randomBytes} from 'react-native-randombytes'
import ExtendableError from 'es6-error'
import bs58 from 'bs58'
import _ from 'lodash'

import {CONFIG} from '../config'

export type AddressType = 'Internal' | 'External'

export type CryptoAccount = {
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
): CryptoAccount => {
  const wallet = _result(Wallet.fromMasterKey(masterKey))
  wallet.config.protocol_magic = magic
  return _result(Wallet.newAccount(wallet, 0))
}


const _getAddresses = (account: CryptoAccount, type: AddressType, indexes: Array<number>) =>
  _result(Wallet.generateAddresses(account, type, indexes))


export const getExternalAddresses = (account: CryptoAccount, indexes: Array<number>) =>
  _getAddresses(account, 'External', indexes)

export const getInternalAddresses = (account: CryptoAccount, indexes: Array<number>) =>
  _getAddresses(account, 'Internal', indexes)

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


type FilterAddressesCallback = (addresses: Array<string>) => Promise<Array<string>>


/*
  Note(ppershing): in the future this might need `maxSize` argument to restrict searching
  forever on very big wallets.

  TODO(ppershing): should we also return which values are used?

  Implementation note: Current implementation might in certain situations
  find gaps of size >= gapLimit. We do not consider this to be a problem (at least for now)
*/
export const discoverAddresses = async (
  account: CryptoAccount,
  type: AddressType,
  highestUsedIndex: number,
  filterCallback: FilterAddressesCallback
): Promise<Array<string>> => {
  let addresses = []
  let used = []
  let shouldScanMore = true
  const gapLimit = CONFIG.DISCOVERY_GAP_SIZE
  const batchSize = CONFIG.DISCOVERY_SEARCH_SIZE

  if (batchSize < gapLimit) throw new Error('NotImplemented')

  let startIndex = highestUsedIndex + 1

  while (shouldScanMore) {
    const newAddresses = _getAddresses(account, type, _.range(startIndex, startIndex + batchSize))
    const filtered = await filterCallback(newAddresses)
    shouldScanMore = filtered.length > 0
    startIndex += batchSize
    addresses = [...addresses, ...newAddresses]
    used = [...used, ...filtered]
  }

  const lastUsed = _.findLastIndex(addresses, (addr) => used.includes(addr))
  return addresses.slice(0, lastUsed + gapLimit)
}
