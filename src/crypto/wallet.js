// @flow
import {generateMnemonic, mnemonicToEntropy} from 'bip39'
import {randomBytes} from 'react-native-randombytes'
import {HdWallet, PasswordProtect} from 'rust-cardano-crypto'
import cryptoRandomString from 'crypto-random-string'


export const generateAdaMnemonic = () => generateMnemonic(160, randomBytes)

export function generateWalletMasterKey(secretWords : string, password : string): string {
  const entropy = new Buffer(mnemonicToEntropy(secretWords), 'hex')
  const masterKey = HdWallet.fromEnhancedEntropy(entropy, '')
  const encryptedKey = encryptWithPassword(password, masterKey)
  return encryptedKey
}

function getOrFail(
  result: ?any
): any {
  if (!result) {
    throw new Error('Result not defined')
  }
  return result
}

function encryptWithPassword(
  password: string,
  bytes
): string {
  const salt = new Buffer(cryptoRandomString(2 * 32), 'hex')
  const nonce = new Buffer(cryptoRandomString(2 * 12), 'hex')
  const formattedPassword = new TextEncoder().encode(password)
  const encryptedBytes = getOrFail(
    PasswordProtect.encryptWithPassword(formattedPassword, salt, nonce, bytes))
  const encryptedHex = Buffer.from(encryptedBytes).toString('hex')
  return encryptedHex
}
