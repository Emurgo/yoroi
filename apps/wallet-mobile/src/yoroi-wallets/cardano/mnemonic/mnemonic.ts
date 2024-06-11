import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {generateMnemonic, mnemonicToEntropy} from 'bip39'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {randomBytes} from 'react-native-randombytes'

const mnemonicStrengh = 160
export const generateAdaMnemonic = () => generateMnemonic(mnemonicStrengh, randomBytes)

export const generateWalletRootKey = async (mnemonic: string, csl: WasmModuleProxy) => {
  const bip39entropy = mnemonicToEntropy(mnemonic)
  const emptyPassword = Buffer.from('')
  const rootKey = await csl.Bip32PrivateKey.fromBip39Entropy(Buffer.from(bip39entropy, 'hex'), emptyPassword)

  return rootKey
}
