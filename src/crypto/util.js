import {mnemonicToEntropy} from 'bip39'
import {HdWallet, Wallet} from 'rust-cardano-crypto'
import {CONFIG} from '../config'

export type AddressType = 'Internal' | 'External'

export const _result = <T>(rustResult: {failed: boolean, result: T}): T => {
  if (rustResult.failed) throw new Error('Crypto error')
  return rustResult.result
}

export const getMasterKeyFromMnemonic = (mnemonic) => {
  const entropy = new Buffer(mnemonicToEntropy(mnemonic), 'hex')
  const masterKey = HdWallet.fromEnhancedEntropy(entropy, '')
  return masterKey
}

export const getAccountFromMasterKey = (masterKey, magic = CONFIG.CARDANO.PROTOCOL_MAGIC) => {
  const wallet = _result(Wallet.fromMasterKey(masterKey))
  wallet.config.protocol_magic = magic
  return _result(Wallet.newAccount(wallet, 0))
}

export const getExternalAddresses = (account, indexes) =>
  _result(Wallet.generateAddresses(account, 'External', indexes))

export const getInternalAddresses = (account, indexes) =>
  _result(Wallet.generateAddresses(account, 'Internal', indexes))
