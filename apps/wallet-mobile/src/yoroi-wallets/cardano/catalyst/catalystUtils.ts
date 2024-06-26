import {mnemonicToEntropy} from 'bip39'

import {CardanoMobile} from '../../wallets'
import {generateAdaMnemonic} from '../mnemonic/mnemonic'

export async function generatePrivateKeyForCatalyst() {
  const mnemonic = generateAdaMnemonic()
  const bip39entropy = mnemonicToEntropy(mnemonic)
  const EMPTY_PASSWORD = Buffer.from('')
  const rootKey = await CardanoMobile.Bip32PrivateKey.fromBip39Entropy(Buffer.from(bip39entropy, 'hex'), EMPTY_PASSWORD)

  return rootKey
}
