import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {generateMnemonic, mnemonicToEntropy} from 'bip39'

import {CardanoMobileWrapped} from '../wrappedCsl'

const {randomBytes} = require('react-native-randombytes')

const mnemonicStrengh = 160

export const generateAdaMnemonic = () =>
  generateMnemonic(mnemonicStrengh, randomBytes)

export const generateWalletRootKey = (
  mnemonic: string,
  csl: WasmModuleProxy,
) => {
  const bip39entropy = mnemonicToEntropy(mnemonic)
  const entropyBuffer = Buffer.from(bip39entropy, 'hex')
  const entropyUint8 = new Uint8Array(entropyBuffer)
  const emptyPassword = new Uint8Array()
  try {
    const rootKey = csl.Bip32PrivateKey.fromBip39Entropy(
      entropyUint8,
      emptyPassword,
    )
    return rootKey
  } catch (error) {
    throw new Error(`Failed to generate wallet root key: ${error}`)
  }
}

export const getMasterKeyFromMnemonic = (mnemonic: string) => {
  return CardanoMobileWrapped.cslScope((wasm) => {
    const rootKeyPtr = generateWalletRootKey(mnemonic, csl)
    return rootKeyPtr.asBytes()
  })
}
