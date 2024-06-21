import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {Wallet} from '@yoroi/types'
import {generateMnemonic, mnemonicToEntropy} from 'bip39'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {randomBytes} from 'react-native-randombytes'

import {CardanoMobile} from '../../wallets'
import {AddressGenerator} from '../account-manager/account-manager'
import {cardanoConfig} from '../constants/cardano-config'
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

export const deriveAddressFromMnemonics = async ({
  phrase,
  count,
  chainId,
  role,
  implementation,
  accountVisual,
}: {
  phrase: string
  count: number
  chainId: number
  role: number
  implementation: Wallet.Implementation
  accountVisual: number
}) => {
  const implementationConfig = cardanoConfig.implementations[implementation]
  const {purpose, coinType} = implementationConfig.derivations.base.harden

  const rootKey = await getMasterKeyFromMnemonic(phrase)
  const accountPubKey = await CardanoMobile.Bip32PrivateKey.fromBytes(Buffer.from(rootKey, 'hex'))
    .then((root) => root.derive(purpose))
    .then((withPurpose) => withPurpose.derive(coinType))
    .then((withCoinType) => withCoinType.derive(accountVisual + cardanoConfig.derivation.hardStart))
    .then((withAccount) => withAccount.toPublic())

  const accountPubKeyHex = Buffer.from(await accountPubKey.asBytes()).toString('hex')

  const addrGenerator = new AddressGenerator(accountPubKeyHex, role, implementation, chainId)
  const addresses = await addrGenerator.generate([...Array(count).keys()])

  return addresses
}
