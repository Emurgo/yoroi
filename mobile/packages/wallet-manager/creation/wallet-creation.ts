import {Blockies} from '@yoroi/identicon'
import {Chain, HW, Wallet} from '@yoroi/types'

import {v4} from 'uuid'

import {getLogger} from '@yoroi/common'
import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'
import {deriveAccountFromRootKey} from '@yoroi/cardano-wallet/key-manager/key-manager'
import {CardanoMobileWrapped} from '@yoroi/cardano-wallet/wrappedCsl'

import {createWalletMeta} from '../lifecycle/wallet-lifecycle'
import {getWalletFactory} from '../network-manager/get-wallet-factory'

/**
 * Create wallet from mnemonic
 */
export const createWalletFromMnemonic = async (params: {
  name: string
  mnemonic: string
  password: string
  implementation: Wallet.Implementation
  addressMode: Wallet.AddressMode
  accountVisual: number
  network: Chain.SupportedNetworks
  version: number
}): Promise<Wallet.Meta> => {
  const {
    name,
    mnemonic,
    password,
    implementation,
    addressMode,
    accountVisual,
    network,
    version,
  } = params

  const walletFactory = getWalletFactory({network, implementation})
  const id = v4()

  const {rootKey, accountPubKeyHex} = CardanoMobileWrapped.cslScope((csl) =>
    walletFactory.makeKeys({
      mnemonic,
      csl,
    }),
  )

  const encryptedStorage = makeWalletEncryptedStorage(id)
  await encryptedStorage.xpriv.write(rootKey, password)
  await encryptedStorage.xpub.write(accountVisual, accountPubKeyHex)

  const {ImagePart: seed, TextPart: plate} =
    walletFactory.calcChecksum(accountPubKeyHex)
  const avatar = Blockies({seed}).asBase64()

  const meta = await createWalletMeta(
    id,
    name,
    0, // networkId - deprecated
    implementation,
    addressMode,
    false, // isHW
    false, // isEasyConfirmationEnabled
    plate,
    avatar,
    false, // isReadOnly
    null, // hwDeviceInfo
    version,
  )

  return meta
}

/**
 * Create wallet from xpub (hardware wallet or read-only)
 */
export const createWalletFromXPub = async (params: {
  name: string
  accountPubKeyHex: string
  implementation: Wallet.Implementation
  hwDeviceInfo: null | HW.DeviceInfo
  isReadOnly: boolean
  addressMode: Wallet.AddressMode
  accountVisual: number
  network: Chain.SupportedNetworks
  version: number
}): Promise<Wallet.Meta> => {
  const {
    name,
    accountPubKeyHex,
    implementation,
    hwDeviceInfo,
    isReadOnly,
    addressMode,
    accountVisual,
    network,
    version,
  } = params

  const walletFactory = getWalletFactory({network, implementation})
  const id = v4()

  const encryptedStorage = makeWalletEncryptedStorage(id)
  // Store accountPubKeyHex for both read-only and full wallets
  // This allows loadWallet to fall back to building a regular wallet if address data is missing
  if (accountVisual === 0) {
    await encryptedStorage.xpub.write(accountVisual, accountPubKeyHex)
  }

  const {ImagePart: seed, TextPart: plate} =
    walletFactory.calcChecksum(accountPubKeyHex)
  const avatar = Blockies({seed}).asBase64()

  const meta = await createWalletMeta(
    id,
    name,
    0, // networkId - deprecated
    implementation,
    addressMode,
    hwDeviceInfo !== null, // isHW
    false, // isEasyConfirmationEnabled
    plate,
    avatar,
    isReadOnly,
    hwDeviceInfo,
    version,
  )

  return meta
}

/**
 * Create wallet from root key hex (for restoration from links)
 */
export const createWalletFromRootKey = async (params: {
  name: string
  rootKeyHex: string
  password: string
  implementation: Wallet.Implementation
  addressMode: Wallet.AddressMode
  accountVisual: number
  network: Chain.SupportedNetworks
  version: number
}): Promise<Wallet.Meta> => {
  const {
    name,
    rootKeyHex,
    password,
    implementation,
    addressMode,
    accountVisual,
    network,
    version,
  } = params

  const walletFactory = getWalletFactory({network, implementation})
  const id = v4()

  // Derive accountPubKeyHex from rootKeyHex
  const accountPubKeyHex = CardanoMobileWrapped.cslScope((csl) =>
    deriveAccountFromRootKey(rootKeyHex, accountVisual, implementation, csl),
  )

  const encryptedStorage = makeWalletEncryptedStorage(id)
  await encryptedStorage.xpriv.write(rootKeyHex, password)
  await encryptedStorage.xpub.write(accountVisual, accountPubKeyHex)

  const {ImagePart: seed, TextPart: plate} =
    walletFactory.calcChecksum(accountPubKeyHex)
  const avatar = Blockies({seed}).asBase64()

  const meta = await createWalletMeta(
    id,
    name,
    0, // networkId - deprecated
    implementation,
    addressMode,
    false, // isHW
    false, // isEasyConfirmationEnabled
    plate,
    avatar,
    false, // isReadOnly
    null, // hwDeviceInfo
    version,
  )

  return meta
}

/**
 * Derive and store account for a wallet
 */
export const deriveAndStoreAccount = async (params: {
  id: string
  accountVisual: number
  password: string
  implementation: Wallet.Implementation
}): Promise<string> => {
  const {id, accountVisual, password, implementation} = params

  const encryptedStorage = makeWalletEncryptedStorage(id)
  const rootKeyResult = await encryptedStorage.xpriv.read(password)
  const rootKeyHex = rootKeyResult.value

  const accountPubKeyHex = CardanoMobileWrapped.cslScope((csl) =>
    deriveAccountFromRootKey(rootKeyHex, accountVisual, implementation, csl),
  )

  await encryptedStorage.xpub.write(accountVisual, accountPubKeyHex)

  getLogger().debug('deriveAndStoreAccount: Account derived and stored', {
    walletId: id,
    accountVisual,
  })

  return accountPubKeyHex
}
