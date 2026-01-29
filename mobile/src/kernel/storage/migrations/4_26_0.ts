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
  // Get wallet IDs - throw on error to trigger retry (don't skip permanently)
  const walletIds = await walletsRootStorage.getAllKeys()

  // If no wallets exist, migration is complete (nothing to migrate)
  if (walletIds.length === 0) {
    logger.info('4_26_0: No wallets found, migration skipped')
    return
  }

  // Get wallet metas - throw on error to trigger retry (don't skip permanently)
  const walletMetas = await walletsRootStorage
    .multiGet(walletIds)
    .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))

  const metasToMigrate = walletMetas.filter(isWalletMetaV1)

  // If no wallets need migration, we're done
  if (metasToMigrate.length === 0) {
    logger.info('4_26_0: No wallets need addressMode migration')
    return
  }

  // Use Promise.allSettled to handle individual wallet failures gracefully
  const results = await Promise.allSettled(metasToMigrate.map(addAddressMode))

  // Analyze failures
  const failures = results.filter(
    (r): r is PromiseRejectedResult => r.status === 'rejected',
  )
  const successCount = results.filter((r) => r.status === 'fulfilled').length

  logger.info('4_26_0: Address mode migration completed', {
    totalWallets: metasToMigrate.length,
    successCount,
    failedCount: failures.length,
  })

  // If ALL wallets failed to migrate, throw to trigger retry
  // This indicates a systemic storage issue, not individual wallet corruption
  if (failures.length > 0 && successCount === 0) {
    logger.error('4_26_0: All wallet migrations failed', {
      errors: failures.map((f) => String(f.reason)),
    })
    throw new Error(
      `Failed to migrate addressMode for all ${metasToMigrate.length} wallets`,
    )
  }

  // If some (but not all) failed, log warning but don't throw
  // Users can recover these wallets individually later
  if (failures.length > 0) {
    logger.warn('4_26_0: Some wallet migrations failed', {
      totalWallets: metasToMigrate.length,
      failedCount: failures.length,
      errors: failures.map((f) => String(f.reason)),
    })
  }
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
