import {App} from '@yoroi/types'

import {WalletMeta} from '../../../features/WalletManager/common/types'
import {WALLET_IMPLEMENTATION_REGISTRY} from '../../../yoroi-wallets/types/other'

export const migrateAddressMode = async (rootStorage: App.Storage) => {
  const walletsRootStorage = rootStorage.join('wallet/')
  const addAddressMode = addAddressModeWrapper(walletsRootStorage)

  // moved from /wallet/ -> /
  await walletsRootStorage.removeItem('deletedWalletIds')

  // add the addressMode defaulted to 'single' to all wallet metas
  const walletIds = await walletsRootStorage.getAllKeys()
  const walletMetas = await walletsRootStorage
    .multiGet(walletIds)
    .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))

  const metasToMigrate = walletMetas.filter(isWalletMetaV1)
  const migrations = metasToMigrate.map(addAddressMode)
  await Promise.all(migrations)
}

const addAddressModeWrapper = (walletsRootStorage: App.Storage) => async (walletMetaToMigrate: WalletMeta) => {
  return walletsRootStorage.setItem(walletMetaToMigrate.id, {...walletMetaToMigrate, addressMode: 'single'})
}

export const to4_26_0 = migrateAddressMode

export function isWalletMetaV1(walletMeta: unknown): walletMeta is WalletMeta {
  if (walletMeta == null) return false
  if (typeof walletMeta !== 'object') return false
  return (
    // prettier-ignore
    !!walletMeta &&
    'id' in walletMeta
      && typeof walletMeta.id === 'string' &&
    'name' in walletMeta
      && typeof walletMeta.name === 'string' &&
    'networkId' in walletMeta
      && typeof walletMeta.networkId === 'number' &&
    'isHW' in walletMeta
      && typeof walletMeta.isHW === 'boolean' &&
    'isEasyConfirmationEnabled' in walletMeta
      && typeof walletMeta.isEasyConfirmationEnabled === 'boolean' &&
    'checksum' in walletMeta
      && typeof walletMeta.checksum === 'object' &&
    ('provider' in walletMeta
      && typeof walletMeta.provider === 'string'
      || !('provider' in walletMeta)) &&
    'walletImplementationId' in walletMeta
      && typeof walletMeta.walletImplementationId === 'string'
      && Object.values(WALLET_IMPLEMENTATION_REGISTRY).includes(walletMeta?.walletImplementationId as never) &&
    ('isShelley' in walletMeta
      && typeof walletMeta.isShelley === 'boolean'
      || !('isShelley' in walletMeta)) && 
    (!('addressMode' in walletMeta) || typeof walletMeta.addressMode !== 'string')
  )
}
