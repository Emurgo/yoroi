/**
 * Local transaction context for same-app wallet sharing
 * Enables wallets in the same Yoroi app instance to share transaction JSON
 * without requiring P2P or file export/import
 */
import {Bip32PublicKeyHex} from '@yoroi/types'

import {freeze} from 'immer'

import {MultisigTransactionJSON, TransactionCborHex} from './transaction-json'

/**
 * Transaction signer information
 */
export type TransactionSignerInfo = {
  readonly walletId: string
  readonly publicKey: Bip32PublicKeyHex
  readonly signed: boolean
  readonly signedAt?: Date
}

/**
 * Transaction state in the registry
 */
export type TransactionState = {
  readonly transactionId: string
  readonly transactionJson: MultisigTransactionJSON
  readonly signers: ReadonlyMap<string, TransactionSignerInfo> // keyed by walletId
  readonly status: 'pending' | 'partially-signed' | 'ready' | 'submitted'
  readonly createdAt: Date
  readonly updatedAt: Date
}

/**
 * Transaction registry for managing same-app transaction sharing
 */
type TransactionRegistry = {
  readonly transactions: ReadonlyMap<string, TransactionState>
  readonly subscribers: ReadonlyMap<
    string,
    ReadonlySet<(state: TransactionState) => void>
  >
}

/**
 * Create a new transaction registry
 */
const createTransactionRegistry = (): TransactionRegistry => {
  return freeze({
    transactions: new Map(),
    subscribers: new Map(),
  })
}

// Global registry instance (singleton pattern)
let registry: TransactionRegistry = createTransactionRegistry()

/**
 * Reset the registry (useful for testing)
 */
export const resetTransactionRegistry = (): void => {
  registry = createTransactionRegistry()
}

/**
 * Generate a unique transaction ID
 */
const generateTransactionId = (): string => {
  return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Register a transaction for sharing
 * Returns the transaction ID
 */
export const registerTransaction = (
  transactionJson: MultisigTransactionJSON,
  signerWalletIds: ReadonlyArray<string>,
): string => {
  const transactionId = generateTransactionId()
  const now = new Date()

  // Initialize signers map
  const signers = new Map<string, TransactionSignerInfo>()
  for (const walletId of signerWalletIds) {
    // Find the signer's public key from transaction metadata
    const signerPublicKey =
      transactionJson.metadata.signers?.find((s) => s.walletId === walletId)
        ?.publicKey || transactionJson.metadata.createdBy

    signers.set(walletId, {
      walletId,
      publicKey: signerPublicKey as Bip32PublicKeyHex,
      signed: false,
    })
  }

  const transactionState: TransactionState = freeze({
    transactionId,
    transactionJson,
    signers,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  })

  // Update registry
  const newTransactions = new Map(registry.transactions)
  newTransactions.set(transactionId, transactionState)

  registry = freeze({
    ...registry,
    transactions: newTransactions,
  })

  // Notify subscribers
  notifySubscribers(transactionId, transactionState)

  return transactionId
}

/**
 * Get transaction state by ID
 */
export const getTransactionState = (
  transactionId: string,
): TransactionState | null => {
  return registry.transactions.get(transactionId) ?? null
}

/**
 * Update transaction with a signature from a wallet
 */
export const addSignatureToTransaction = (
  transactionId: string,
  walletId: string,
  signedTransactionJson: MultisigTransactionJSON,
): void => {
  const currentState = registry.transactions.get(transactionId)
  if (!currentState) {
    throw new Error(`Transaction ${transactionId} not found`)
  }

  const signer = currentState.signers.get(walletId)
  if (!signer) {
    throw new Error(
      `Wallet ${walletId} is not a signer for transaction ${transactionId}`,
    )
  }

  // Update signer info
  const updatedSigners = new Map(currentState.signers)
  updatedSigners.set(
    walletId,
    freeze({
      ...signer,
      signed: true,
      signedAt: new Date(),
    }),
  )

  // Determine new status
  const signedCount = Array.from(updatedSigners.values()).filter(
    (s) => s.signed,
  ).length
  const totalSigners = updatedSigners.size

  let newStatus: TransactionState['status'] = currentState.status
  if (signedCount === totalSigners) {
    newStatus = 'ready'
  } else if (signedCount > 0) {
    newStatus = 'partially-signed'
  }

  // Update transaction state
  const updatedState: TransactionState = freeze({
    ...currentState,
    transactionJson: signedTransactionJson,
    signers: updatedSigners,
    status: newStatus,
    updatedAt: new Date(),
  })

  // Update registry
  const newTransactions = new Map(registry.transactions)
  newTransactions.set(transactionId, updatedState)

  registry = freeze({
    ...registry,
    transactions: newTransactions,
  })

  // Notify subscribers
  notifySubscribers(transactionId, updatedState)
}

/**
 * Mark transaction as submitted
 */
export const markTransactionSubmitted = (transactionId: string): void => {
  const currentState = registry.transactions.get(transactionId)
  if (!currentState) {
    throw new Error(`Transaction ${transactionId} not found`)
  }

  const updatedState: TransactionState = freeze({
    ...currentState,
    status: 'submitted',
    updatedAt: new Date(),
  })

  // Update registry
  const newTransactions = new Map(registry.transactions)
  newTransactions.set(transactionId, updatedState)

  registry = freeze({
    ...registry,
    transactions: newTransactions,
  })

  // Notify subscribers
  notifySubscribers(transactionId, updatedState)
}

/**
 * Subscribe to transaction updates
 * Returns unsubscribe function
 */
export const subscribeToTransaction = (
  transactionId: string,
  callback: (state: TransactionState) => void,
): (() => void) => {
  const currentSubscribers =
    registry.subscribers.get(transactionId) ?? new Set()
  const newSubscribers = new Set(currentSubscribers)
  newSubscribers.add(callback)

  const newSubscribersMap = new Map(registry.subscribers)
  newSubscribersMap.set(transactionId, newSubscribers)

  registry = freeze({
    ...registry,
    subscribers: newSubscribersMap,
  })

  // Immediately call callback with current state if available
  const currentState = registry.transactions.get(transactionId)
  if (currentState) {
    callback(currentState)
  }

  // Return unsubscribe function
  return () => {
    const currentSubscribers =
      registry.subscribers.get(transactionId) ?? new Set()
    const newSubscribers = new Set(currentSubscribers)
    newSubscribers.delete(callback)

    if (newSubscribers.size === 0) {
      const newSubscribersMap = new Map(registry.subscribers)
      newSubscribersMap.delete(transactionId)
      registry = freeze({
        ...registry,
        subscribers: newSubscribersMap,
      })
    } else {
      const newSubscribersMap = new Map(registry.subscribers)
      newSubscribersMap.set(transactionId, newSubscribers)
      registry = freeze({
        ...registry,
        subscribers: newSubscribersMap,
      })
    }
  }
}

/**
 * Notify all subscribers of a transaction update
 */
const notifySubscribers = (
  transactionId: string,
  state: TransactionState,
): void => {
  const subscribers = registry.subscribers.get(transactionId)
  if (subscribers) {
    for (const callback of subscribers) {
      try {
        callback(state)
      } catch (error) {
        // Log error but don't break other subscribers
        console.error(
          `Error in transaction subscriber for ${transactionId}:`,
          error,
        )
      }
    }
  }
}

/**
 * Get all transactions for a specific wallet
 */
export const getTransactionsForWallet = (
  walletId: string,
): ReadonlyArray<TransactionState> => {
  return Array.from(registry.transactions.values()).filter((state) =>
    state.signers.has(walletId),
  )
}

/**
 * Remove transaction from registry (cleanup)
 */
export const removeTransaction = (transactionId: string): void => {
  const newTransactions = new Map(registry.transactions)
  newTransactions.delete(transactionId)

  const newSubscribers = new Map(registry.subscribers)
  newSubscribers.delete(transactionId)

  registry = freeze({
    transactions: newTransactions,
    subscribers: newSubscribers,
  })
}

/**
 * Check if all signers for a transaction are in the same app
 * This is used to determine if local context sharing can be used
 */
export const areAllSignersInSameApp = (
  transactionId: string,
  availableWalletIds: ReadonlyArray<string>,
): boolean => {
  const state = registry.transactions.get(transactionId)
  if (!state) {
    return false
  }

  const signerWalletIds = Array.from(state.signers.keys())
  return signerWalletIds.every((walletId) =>
    availableWalletIds.includes(walletId),
  )
}
