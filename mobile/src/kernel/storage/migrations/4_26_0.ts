import {App} from '@yoroi/types'

import {logger} from '~/kernel/logger/logger'

export const migrateAddressMode = async (rootStorage: App.Storage) => {
  const walletsRootStorage = rootStorage.join('wallet/')
  const addAddressMode = addAddressModeWrapper(walletsRootStorage)

  // moved from /wallet/ -> /
  try {
    await walletsRootStorage.removeItem('deletedWalletIds')
  } catch (error) {
    logger.warn('4_26_0: Failed to remove deletedWalletIds, continuing', {
      error,
    })
  }

  // add the addressMode defaulted to 'single' to all wallet metas
  let walletIds: readonly string[] = []
  try {
    walletIds = await walletsRootStorage.getAllKeys()
  } catch (error) {
    logger.error('4_26_0: Failed to get wallet keys', {error})
    // If we can't get wallet IDs, skip this migration gracefully
    return
  }

  let walletMetas: unknown[] = []
  try {
    walletMetas = await walletsRootStorage
      .multiGet(walletIds)
      .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))
  } catch (error) {
    logger.error('4_26_0: Failed to get wallet metas', {error})
    // If we can't get metas, skip this migration gracefully
    return
  }

  const metasToMigrate = walletMetas.filter(isWalletMetaV1)

  // Use Promise.allSettled to handle individual wallet failures gracefully
  const results = await Promise.allSettled(metasToMigrate.map(addAddressMode))

  // Log any failures but don't throw - migration should continue
  const failures = results.filter(
    (r): r is PromiseRejectedResult => r.status === 'rejected',
  )
  if (failures.length > 0) {
    logger.warn('4_26_0: Some wallet migrations failed', {
      totalWallets: metasToMigrate.length,
      failedCount: failures.length,
      errors: failures.map((f) => String(f.reason)),
    })
  }

  logger.info('4_26_0: Address mode migration completed', {
    totalWallets: metasToMigrate.length,
    successCount: results.filter((r) => r.status === 'fulfilled').length,
    failedCount: failures.length,
  })
}

const addAddressModeWrapper =
  (walletsRootStorage: App.Storage) =>
  async (walletMetaToMigrate: WalletMetaV1) => {
    return walletsRootStorage.setItem(walletMetaToMigrate.id, {
      ...walletMetaToMigrate,
      addressMode: 'single',
    })
  }

export const to4_26_0 = migrateAddressMode

export function isWalletMetaV1(
  walletMeta: unknown,
): walletMeta is WalletMetaV1 {
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
      && typeof walletMeta.walletImplementationId === 'string' &&
    ('isShelley' in walletMeta
      && typeof walletMeta.isShelley === 'boolean'
      || !('isShelley' in walletMeta)) && 
    (!('addressMode' in walletMeta) || typeof walletMeta.addressMode !== 'string')
  )
}

type WalletMetaV1 = {
  id: string
  name: string
  networkId: number
  isHW: boolean
  isEasyConfirmationEnabled: boolean
  checksum: unknown
  provider?: string
  walletImplementationId: string
  isShelley?: boolean
}
