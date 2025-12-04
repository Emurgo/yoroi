import type {WalletEncryptedStorage} from '@yoroi/cardano-wallet'
import {YoroiWallet} from '@yoroi/cardano-wallet'
import {getLogger} from '@yoroi/common'
import {App, Chain, Network, Wallet} from '@yoroi/types'

import {KeychainManager} from '~/kernel/storage/Keychain'

import {getWalletFactory} from '../network-manager/get-wallet-factory'

/**
 * Create wallet metadata
 */
export const createWalletMeta = async (
  id: string,
  name: string,
  _networkId: number,
  implementation: Wallet.Implementation,
  addressMode: Wallet.AddressMode,
  isHW: boolean,
  isEasyConfirmationEnabled: boolean,
  plate: string,
  avatar: string,
  isReadOnly: boolean,
  hwDeviceInfo: Wallet.Meta['hwDeviceInfo'],
  version: number,
): Promise<Wallet.Meta> => {
  const meta: Wallet.Meta = {
    version,
    id,
    plate,
    name,
    avatar,
    implementation,
    addressMode,
    isReadOnly,
    hwDeviceInfo,
    isHW,
    isEasyConfirmationEnabled,
  }

  return meta
}

/**
 * Load wallet from storage
 */
export const loadWalletFromStorage = async (
  id: string,
  implementation: Wallet.Implementation,
  network: Chain.SupportedNetworks,
  _networkManagers: Readonly<Record<Chain.SupportedNetworks, Network.Manager>>,
): Promise<YoroiWallet> => {
  const walletFactory = getWalletFactory({network, implementation})

  const wallet = await walletFactory.build({
    id,
    accountVisual: 0, // Default account visual
  })

  return wallet
}

/**
 * Save wallet metadata to storage
 */
export const saveWalletMeta = async (
  meta: Wallet.Meta,
  walletsRootStorage: App.Storage,
): Promise<void> => {
  await walletsRootStorage.setItem(meta.id, meta)
  getLogger().debug('saveWalletMeta: Wallet meta saved', {walletId: meta.id})
}

/**
 * Remove wallet from storage
 */
export const removeWalletFromStorage = async (
  id: string,
  walletsRootStorage: App.Storage,
  makeWalletEncryptedStorage: (id: string) => WalletEncryptedStorage,
  keychainManager?: KeychainManager,
): Promise<void> => {
  // Remove wallet metadata
  await walletsRootStorage.removeItem(id)

  // Remove wallet storage folder
  const walletStorage = walletsRootStorage.join(`${id}/`)
  await walletStorage.removeFolder(`${id}/`)

  // Remove encrypted storage
  const encryptedStorage = makeWalletEncryptedStorage(id)
  await encryptedStorage.clear()

  // Remove keychain entry if available
  if (keychainManager) {
    try {
      await keychainManager.removeWalletKey(id)
    } catch (error) {
      getLogger().warn(
        'removeWalletFromStorage: Error removing keychain entry',
        {
          walletId: id,
          error,
        },
      )
    }
  }

  getLogger().debug('removeWalletFromStorage: Wallet removed', {walletId: id})
}

/**
 * Get all wallet metadata from storage
 */
export const getAllWalletMetas = async (
  walletsRootStorage: App.Storage,
): Promise<Map<string, Wallet.Meta>> => {
  const walletIds = await walletsRootStorage.getAllKeys()
  const walletMetas = await walletsRootStorage
    .multiGet(walletIds)
    .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))

  const metasMap = new Map<string, Wallet.Meta>()
  for (const meta of walletMetas) {
    if (meta && typeof meta === 'object' && 'id' in meta) {
      metasMap.set(meta.id as string, meta as Wallet.Meta)
    }
  }

  return metasMap
}
