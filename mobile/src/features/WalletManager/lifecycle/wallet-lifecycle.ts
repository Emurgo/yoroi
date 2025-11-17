import {App, Chain, Network, Wallet} from '@yoroi/types'

import {logger} from '~/kernel/logger/logger'
import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'
import {KeychainManager} from '~/kernel/storage/Keychain'
import {YoroiWallet} from '~/wallets/cardano/types'

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
  logger.debug('saveWalletMeta: Wallet meta saved', {walletId: meta.id})
}

/**
 * Remove wallet from storage
 */
export const removeWalletFromStorage = async (
  id: string,
  walletsRootStorage: App.Storage,
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
      logger.warn('removeWalletFromStorage: Error removing keychain entry', {
        walletId: id,
        error,
      })
    }
  }

  logger.debug('removeWalletFromStorage: Wallet removed', {walletId: id})
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
