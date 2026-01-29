import {Blockies} from '@yoroi/identicon'
import {App, HW, Wallet} from '@yoroi/types'

import {WalletChecksum} from '@emurgo/cip4-js'

import {logger} from '~/kernel/logger/logger'
import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'

const migrateWalletMeta = async (rootStorage: App.Storage) => {
  const walletsRootStorage = rootStorage.join('wallet/')
  const migrate = updateMeta(walletsRootStorage)

  // Get wallet IDs - throw on error to trigger retry (don't skip permanently)
  const walletIds = await walletsRootStorage.getAllKeys()

  // If no wallets exist, migration is complete (nothing to migrate)
  if (walletIds.length === 0) {
    logger.info('4_28_0: No wallets found, migration skipped')
    return
  }

  // Get wallet metas - throw on error to trigger retry (don't skip permanently)
  const walletMetas = await walletsRootStorage
    .multiGet(walletIds)
    .then((tuples) => tuples.map(([_, walletMeta]) => walletMeta))

  const metas = walletMetas.filter(isWalletMetaV2)

  // If no wallets need migration, we're done
  if (metas.length === 0) {
    logger.info('4_28_0: No wallets need version/implementation migration')
    return
  }

  let successCount = 0
  let failedCount = 0
  const errors: string[] = []

  // Process wallets individually with error handling
  for (const meta of metas) {
    try {
      await migrate(meta)
      successCount++
    } catch (error) {
      failedCount++
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      errors.push(errorMessage)

      logger.warn('4_28_0: Failed to migrate wallet, continuing with others', {
        walletId: meta.id,
        walletName: meta.name,
        error: errorMessage,
      })
      // Continue with other wallets - don't let one bad wallet block all
    }
  }

  logger.info('4_28_0: Wallet meta migration completed', {
    totalWallets: metas.length,
    successCount,
    failedCount,
  })

  // If ALL wallets failed to migrate, throw to trigger retry
  // This indicates a systemic storage issue, not individual wallet corruption
  if (failedCount > 0 && successCount === 0) {
    logger.error('4_28_0: All wallet migrations failed', {errors})
    throw new Error(
      `Failed to migrate version/implementation for all ${metas.length} wallets`,
    )
  }
}

// before 4.28 yoroi supported only account 0
const accountVisual = 0
const updateMeta =
  (walletsRootStorage: App.Storage) => async (meta: WalletMetaV2) => {
    // added
    const version = 3

    // migragted
    const implementation: Wallet.Implementation =
      meta.walletImplementationId.includes('shelley')
        ? 'cardano-cip1852'
        : 'cardano-bip44'
    const plate = meta.checksum.TextPart
    const avatar = Blockies({seed: meta.checksum.ImagePart}).asBase64()

    const walletStorage = walletsRootStorage.join(`${meta.id}/`)
    const data = (await walletStorage.getItem('data')) as {
      isReadOnly?: boolean
      hwDeviceInfo?: HW.DeviceInfo
      publicKeyHex?: string
    }
    const isReadOnly = data?.isReadOnly ?? false
    const hwDeviceInfo = data?.hwDeviceInfo ?? null
    const publicKeyHex = data?.publicKeyHex ?? ''

    await makeWalletEncryptedStorage(meta.id).xpub.write(
      accountVisual,
      publicKeyHex,
    )

    // copied over
    const {isHW, addressMode, name, id, isEasyConfirmationEnabled} = meta

    const upgradedMeta: Wallet.Meta = {
      // added
      version,
      isReadOnly,

      // migrated
      implementation,
      plate,
      avatar,
      hwDeviceInfo,

      // copied over
      id,
      name,
      addressMode,
      isHW,
      isEasyConfirmationEnabled,
    }

    return walletsRootStorage.setItem(id, upgradedMeta)
  }

export const to4_28_0 = migrateWalletMeta

type WalletMetaV2 = {
  id: string
  name: string
  isHW: boolean
  isEasyConfirmationEnabled: boolean
  addressMode: Wallet.AddressMode
  walletImplementationId: string
  checksum: WalletChecksum
  networkId: number
}
export function isWalletMetaV2(
  walletMeta: unknown,
): walletMeta is WalletMetaV2 {
  if (walletMeta == null) return false
  if (typeof walletMeta !== 'object') return false
  return (
    // prettier-ignore
    !!walletMeta &&
    'id' in walletMeta
      && typeof walletMeta.id === 'string' &&
    'name' in walletMeta
      && typeof walletMeta.name === 'string' &&
    'isHW' in walletMeta
      && typeof walletMeta.isHW === 'boolean' &&
    'isEasyConfirmationEnabled' in walletMeta
      && typeof walletMeta.isEasyConfirmationEnabled === 'boolean' &&
    'walletImplementationId' in walletMeta
      && typeof walletMeta.walletImplementationId === 'string' &&
    'addressMode' in walletMeta 
      && typeof walletMeta.addressMode === 'string' &&
    !('version' in walletMeta) &&
    'checksum' in walletMeta
      && typeof walletMeta.checksum === 'object'
  )
}
