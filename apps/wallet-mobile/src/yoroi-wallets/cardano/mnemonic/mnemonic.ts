import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {generateMnemonic, mnemonicToEntropy} from 'bip39'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {randomBytes} from 'react-native-randombytes'

import {wrappedCsl} from '../wrappedCsl'

const mnemonicStrengh = 160

export const generateAdaMnemonic = () => generateMnemonic(mnemonicStrengh, randomBytes)

export const generateWalletRootKey = async (mnemonic: string, csl: WasmModuleProxy) => {
  const bip39entropy = mnemonicToEntropy(mnemonic)
  const emptyPassword = Buffer.from('')
  const rootKey = await csl.Bip32PrivateKey.fromBip39Entropy(Buffer.from(bip39entropy, 'hex'), emptyPassword)

  return rootKey
}

export const getMasterKeyFromMnemonic = async (mnemonic: string) => {
  const {csl, release} = wrappedCsl()
  const rootKeyPtr = await generateWalletRootKey(mnemonic, csl)
  const rootKey = Buffer.from(await rootKeyPtr.asBytes()).toString('hex')
  release()
  return rootKey
}
