/* eslint-disable @typescript-eslint/no-explicit-any */
import {generateMnemonic, mnemonicToEntropy} from 'bip39'
import {randomBytes} from 'react-native-randombytes'

import {CardanoMobile} from '../../wallets'

const MNEMONIC_STRENGTH = 160

export const generateAdaMnemonic = () => generateMnemonic(MNEMONIC_STRENGTH, randomBytes)
export const generateWalletRootKey = async (mnemonic: string) => {
  const bip39entropy = mnemonicToEntropy(mnemonic)
  const EMPTY_PASSWORD = Buffer.from('')
  const rootKey = await CardanoMobile.Bip32PrivateKey.fromBip39Entropy(Buffer.from(bip39entropy, 'hex'), EMPTY_PASSWORD)

  return rootKey
}
