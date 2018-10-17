// @flow

import {mnemonicToEntropy, generateMnemonic} from 'bip39'
import {HdWallet, Wallet} from 'rust-cardano-crypto'
import {randomBytes} from 'react-native-randombytes'
import ExtendableError from 'es6-error'
import bs58 from 'bs58'
import _ from 'lodash'

import {CONFIG} from '../config'
import {assertTrue} from '../utils/assert'

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

  Implementation note: Current implementation might in certain situations
  find gaps of size >= gapLimit. We do not consider this to be a problem (at least for now)

  Implementation note: Current implementation returns discovered addresses in multiples of batchSize.
  This might mean that there are more than gapLimit unused addresses at the end. This is consistent with how the
  walletManager's post-discovery phase works.
*/

export type discoverAddressesArg = {
  account: CryptoAccount,
  type: AddressType,
  highestUsedIndex: number,
  startIndex: number,
  filterUsedAddressesFn: FilterAddressesCallback,
  gapLimit: number,
  batchSize: number,
}

export const discoverAddresses = async ({
  account,
  type,
  highestUsedIndex,
  startIndex,
  filterUsedAddressesFn,
  gapLimit,
  batchSize,
}: discoverAddressesArg): Promise<{addresses: Array<string>, used: Array<string>}> => {
  let addresses = []
  let used = []

  assertTrue(
    startIndex % batchSize === 0,
    'discoverAddresses: startIndex is not multiple of batchSize'
  )

  while (highestUsedIndex + gapLimit >= startIndex) {
    const newAddresses = _getAddresses(account, type, _.range(startIndex, startIndex + batchSize))
    const filtered = await filterUsedAddressesFn(newAddresses)
    if (filtered.length > 0) {
      const inBatchIndex = _.findLastIndex(newAddresses, (a) => filtered.includes(a))
      assertTrue(inBatchIndex >= 0, `inBatchIndex ${inBatchIndex}`)
      highestUsedIndex = startIndex + inBatchIndex
    }
    startIndex += batchSize
    addresses = [...addresses, ...newAddresses]
    used = [...used, ...filtered]
  }

  return {
    addresses,
    used,
    highestUsedIndex,
  }
}
