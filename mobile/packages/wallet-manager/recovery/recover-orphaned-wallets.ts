import {Blockies} from '@yoroi/identicon'
import {getLogger} from '@yoroi/logger'
import {App, Wallet} from '@yoroi/types'

import {walletChecksum} from '@emurgo/cip4-js'

import {WALLET_MANAGER_VERSION} from '../wallet-manager'

/**
 * Recover orphaned wallets that have keystore data but no metadata
 * This happens when storage is partially cleared (preserving keystore)
 * after migration failures.
 *
 * For each orphaned wallet:
 * - Reads xpub from keystore/{walletId}/0
 * - Derives plate and avatar from xpub
 * - Creates minimal wallet metadata with plate as name
 * - Detects if wallet is HW (no xpriv) vs regular (has xpriv)
 */
export const recoverOrphanedWallets = async (
  rootStorage: App.Storage,
): Promise<{recoveredCount: number; walletIds: string[]}> => {
  const logger = getLogger()
  logger.info('recoverOrphanedWallets: Starting recovery scan')

  const keyStorage = rootStorage.join('keystore/')
  const walletsRootStorage = rootStorage.join('wallet/')

  try {
    const keystoreKeys = await keyStorage.getAllKeys()
    const walletMetaKeys = await walletsRootStorage.getAllKeys()

    // Find wallet IDs from xpub storage (keystore/{walletId}/{accountVisual})
    // This captures both regular wallets AND HW/read-only wallets
    const walletIdsWithXpub = new Set<string>()
    for (const key of keystoreKeys) {
      // Match pattern: {walletId}/{accountVisual} (e.g., "abc-123/0")
      // Exclude keys that end with -MASTER_PASSWORD
      if (!key.endsWith('-MASTER_PASSWORD') && key.includes('/')) {
        const walletId = key.split('/')[0]
        if (walletId) walletIdsWithXpub.add(walletId)
      }
    }

    // Also check for -MASTER_PASSWORD keys (regular wallets with encrypted xpriv)
    const walletIdsWithXpriv = new Set(
      keystoreKeys
        .filter((key) => key.endsWith('-MASTER_PASSWORD'))
        .map((key) => key.replace('-MASTER_PASSWORD', '')),
    )

    // Combine both sets - a wallet may have xpub only (HW/read-only) or both
    const allKeystoreWalletIds = new Set([
      ...walletIdsWithXpub,
      ...walletIdsWithXpriv,
    ])

    // Find orphaned wallets (have keystore data but no metadata)
    const orphanedWalletIds = [...allKeystoreWalletIds].filter(
      (id) => !walletMetaKeys.includes(id),
    )

    if (orphanedWalletIds.length === 0) {
      logger.debug('recoverOrphanedWallets: No orphaned wallets found')
      return {recoveredCount: 0, walletIds: []}
    }

    logger.info('recoverOrphanedWallets: Found orphaned wallets', {
      count: orphanedWalletIds.length,
      walletIds: orphanedWalletIds,
    })

    const recoveredWalletIds: string[] = []

    for (const walletId of orphanedWalletIds) {
      try {
        // Read xpub to derive plate/avatar (account 0)
        const xpubStorage = keyStorage.join(`${walletId}/`)
        const xpub = await xpubStorage.getItem('0')

        if (!xpub || typeof xpub !== 'string') {
          logger.warn(
            'recoverOrphanedWallets: No xpub found for wallet, skipping',
            {walletId},
          )
          continue
        }

        // Check if this is a regular wallet (has xpriv) or HW/read-only (xpub only)
        const hasXpriv = walletIdsWithXpriv.has(walletId)

        // Derive plate and avatar from xpub
        const checksum = walletChecksum(xpub)
        const plate = checksum.TextPart
        const avatar = Blockies({seed: checksum.ImagePart}).asBase64()

        // Rebuild minimal metadata using plate as name
        const recoveredMeta: Wallet.Meta = {
          version: WALLET_MANAGER_VERSION,
          id: walletId,
          name: plate, // Use plate as name, user can edit later
          plate,
          avatar,
          implementation: 'cardano-cip1852', // Default to Shelley (CIP-1852)
          addressMode: 'single',
          isHW: !hasXpriv, // If no xpriv, assume HW wallet
          isReadOnly: false, // Read-only wallets didn't exist in older versions
          isEasyConfirmationEnabled: false,
          hwDeviceInfo: null, // Lost, user needs to reconnect HW if needed
        }

        await walletsRootStorage.setItem(walletId, recoveredMeta)
        recoveredWalletIds.push(walletId)

        logger.info('recoverOrphanedWallets: Recovered orphaned wallet', {
          walletId,
          plate,
          isHW: !hasXpriv,
        })
      } catch (error) {
        logger.error('recoverOrphanedWallets: Failed to recover wallet', {
          walletId,
          error: error instanceof Error ? error.message : String(error),
        })
        // Continue with next wallet
      }
    }

    logger.info('recoverOrphanedWallets: Recovery complete', {
      recoveredCount: recoveredWalletIds.length,
      walletIds: recoveredWalletIds,
    })

    return {
      recoveredCount: recoveredWalletIds.length,
      walletIds: recoveredWalletIds,
    }
  } catch (error) {
    logger.error('recoverOrphanedWallets: Recovery scan failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    return {recoveredCount: 0, walletIds: []}
  }
}
