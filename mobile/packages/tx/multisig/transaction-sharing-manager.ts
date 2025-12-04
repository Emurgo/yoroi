/**
 * Unified transaction sharing manager
 * Automatically selects the best sharing method based on context
 */
import {Bip32PublicKeyHex, TransactionCborHex} from '@yoroi/types'

import {
  TransactionState,
  addSignatureToTransaction as addLocalSignature,
  areAllSignersInSameApp,
  getTransactionState,
  markTransactionSubmitted,
  registerTransaction,
  subscribeToTransaction,
} from './local-transaction-context'
import {
  MultisigTransactionJSON,
  addSignatureToTransactionJSON,
  constructMultisigTransactionJSON,
} from './transaction-json'

/**
 * Sharing method type
 */
export type SharingMethod = 'local' | 'p2p' | 'file'

/**
 * Transaction sharing result
 */
export type TransactionSharingResult = {
  readonly transactionId: string
  readonly method: SharingMethod
  readonly transactionJson: MultisigTransactionJSON
}

/**
 * Parameters for sharing a transaction
 */
type ShareTransactionParams = {
  readonly cborHex: TransactionCborHex
  readonly chainId: string
  readonly createdBy: Bip32PublicKeyHex
  readonly signerWalletIds: ReadonlyArray<string>
  readonly availableWalletIds: ReadonlyArray<string>
  readonly note?: string
}

/**
 * Parameters for signing a shared transaction
 */
type SignSharedTransactionParams = {
  readonly transactionId: string
  readonly walletId: string
  readonly signedCborHex: TransactionCborHex
}

/**
 * Determine the best sharing method based on context
 */
const determineSharingMethod = (
  signerWalletIds: ReadonlyArray<string>,
  availableWalletIds: ReadonlyArray<string>,
  p2pAvailable: boolean,
): SharingMethod => {
  // Check if all signers are in the same app
  const allSignersInSameApp = signerWalletIds.every((walletId) =>
    availableWalletIds.includes(walletId),
  )

  if (allSignersInSameApp) {
    return 'local'
  }

  // Check if P2P is available
  if (p2pAvailable) {
    return 'p2p'
  }

  // Fallback to file export/import
  return 'file'
}

/**
 * Share a transaction using the best available method
 */
export const shareTransaction = (
  params: ShareTransactionParams,
  p2pAvailable = false,
): TransactionSharingResult => {
  const {
    cborHex,
    chainId,
    createdBy,
    signerWalletIds,
    availableWalletIds,
    note,
  } = params

  // Determine sharing method
  const method = determineSharingMethod(
    signerWalletIds,
    availableWalletIds,
    p2pAvailable,
  )

  // Construct transaction JSON
  const transactionJson = constructMultisigTransactionJSON({
    cborHex,
    chainId: chainId as `cip34:${number}-${number}`,
    createdBy,
    note,
    signers: signerWalletIds.map((walletId) => ({
      walletId,
      publicKey: createdBy, // Will be updated when actual keys are known
      signed: false,
    })),
  })

  // Register transaction for local sharing if method is local
  if (method === 'local') {
    const transactionId = registerTransaction(transactionJson, signerWalletIds)

    return {
      transactionId,
      method: 'local',
      transactionJson,
    }
  }

  // For P2P and file methods, generate a transaction ID but don't register locally
  // (they will be handled by their respective managers)
  const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

  return {
    transactionId,
    method,
    transactionJson,
  }
}

/**
 * Sign a shared transaction
 * Automatically uses the appropriate method based on transaction ID
 */
export const signSharedTransaction = (
  params: SignSharedTransactionParams,
): TransactionState => {
  const {transactionId, walletId, signedCborHex} = params

  // Check if transaction exists in local registry
  const localState = getTransactionState(transactionId)
  if (localState) {
    // Update local transaction
    const currentJson = localState.transactionJson
    const updatedJson = addSignatureToTransactionJSON(
      currentJson,
      currentJson.metadata.createdBy, // Use createdBy as the key (should be updated with actual key)
      walletId,
    )

    addLocalSignature(transactionId, walletId, updatedJson)

    const updatedState = getTransactionState(transactionId)
    if (!updatedState) {
      throw new Error(`Transaction ${transactionId} not found after signing`)
    }

    return updatedState
  }

  // If not in local registry, this is a P2P or file-based transaction
  // Return a minimal state (actual handling will be done by P2P/file managers)
  throw new Error(
    `Transaction ${transactionId} not found in local registry. Use P2P or file sharing methods.`,
  )
}

/**
 * Subscribe to transaction updates
 * Works for local transactions only
 */
export const subscribeToSharedTransaction = (
  transactionId: string,
  callback: (state: TransactionState) => void,
): (() => void) => {
  return subscribeToTransaction(transactionId, callback)
}

/**
 * Check if transaction can use local context sharing
 */
export const canUseLocalContext = (
  transactionId: string,
  availableWalletIds: ReadonlyArray<string>,
): boolean => {
  return areAllSignersInSameApp(transactionId, availableWalletIds)
}

/**
 * Mark transaction as submitted
 */
export const markSharedTransactionSubmitted = (transactionId: string): void => {
  markTransactionSubmitted(transactionId)
}
