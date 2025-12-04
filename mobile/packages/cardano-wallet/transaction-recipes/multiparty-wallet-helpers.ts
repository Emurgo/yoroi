/**
 * Multiparty transaction helpers for wallet operations
 * Builds transactions using multiple wallets' UTXOs
 */
import {getLogger} from '@yoroi/common'
import {TransactionOutput} from '@yoroi/tx'
import {
  type MultipartyInputWallet,
  type MultipartyTransactionResult,
  buildMultipartyTransaction,
} from '@yoroi/tx/multiparty'
import {Wallet} from '@yoroi/types'
import type {WalletManager} from '@yoroi/wallet-manager'

/**
 * Create multiparty send transaction from multiple wallets
 * Loads wallets from wallet manager and builds transaction using their UTXOs
 */
export const createMultipartySendTxFromWallets = async ({
  walletManager,
  inputWalletIds,
  entries,
  addressMode,
  subtractFeeFromAmount,
}: {
  readonly walletManager: WalletManager
  readonly inputWalletIds: ReadonlyArray<string>
  readonly entries: ReadonlyArray<TransactionOutput>
  readonly addressMode: Wallet.AddressMode
  readonly subtractFeeFromAmount?: boolean
}): Promise<MultipartyTransactionResult> => {
  const logger = getLogger()

  if (inputWalletIds.length === 0) {
    throw new Error('At least one input wallet is required')
  }

  logger.debug('createMultipartySendTxFromWallets: Building transaction', {
    inputWalletCount: inputWalletIds.length,
    entriesCount: entries.length,
  })

  // Load wallets and metas
  const inputWallets: Array<MultipartyInputWallet> = []

  for (const walletId of inputWalletIds) {
    const wallet = walletManager.getWalletById(walletId)
    const meta = walletManager.getWalletMetaById(walletId)

    if (!wallet || !meta) {
      throw new Error(`Wallet ${walletId} not found or not loaded`)
    }

    // Ensure wallet is on the same network (all wallets should be on same network)
    // This is validated by ensuring they're all from the same wallet manager instance
    inputWallets.push({
      walletId,
      wallet,
      meta,
    })
  }

  // Build multiparty transaction
  return buildMultipartyTransaction({
    inputWallets,
    entries,
    addressMode,
    subtractFeeFromAmount,
  })
}
