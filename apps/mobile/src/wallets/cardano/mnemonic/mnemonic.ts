import {generateMnemonic, mnemonicToEntropy} from 'bip39'

const {randomBytes} = require('react-native-randombytes')

import {CardanoMobile} from '~/wallets/wallets'

const mnemonicStrengh = 160

export const generateAdaMnemonic = () =>
  generateMnemonic(mnemonicStrengh, randomBytes)

export const generateWalletRootKey = (mnemonic: string) => {
  const bip39entropy = mnemonicToEntropy(mnemonic)
  const entropyBuffer = Buffer.from(bip39entropy, 'hex')
  const entropyUint8 = new Uint8Array(entropyBuffer)
  const emptyPassword = new Uint8Array()
  try {
    const rootKey = CardanoMobile.Bip32PrivateKey.fromBip39Entropy(
      entropyUint8,
      emptyPassword,
    )
    return rootKey
  } catch (error) {
    throw new Error(`Failed to generate wallet root key: ${error}`)
  }
}

export const getMasterKeyFromMnemonic = (mnemonic: string) => {
  const rootKeyPtr = generateWalletRootKey(mnemonic)
  return rootKeyPtr.asBytes()
}
