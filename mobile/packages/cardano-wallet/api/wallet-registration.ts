// @ts-ignore
/**
 * Get backend-zero base URL from legacy API URL
 * @deprecated Use getBackendZeroUrl from '@yoroi/api' instead
 * Re-exported from package to maintain backward compatibility
 */
import {getBackendZeroUrl} from '@yoroi/api'

import QuickCrypto from 'react-native-quick-crypto'

import {getSpendingKey} from '../addressInfo/addressInfo'

/**
 * Wallet registration data for backend-zero
 */
export type WalletRegistrationData = {
  id: string
  paymentKeyHashes: string[]
  rewardAddresses: string[]
  publicKey: string
}

/**
 * Convert wallet ID (UUID or any string) to Ed25519KeyHash format (56 hex characters)
 * Uses SHA256 hash and takes first 56 hex characters (28 bytes)
 * If accountPubKeyHex is provided, uses that as the source for more deterministic IDs
 */
export const convertWalletIdToEd25519KeyHash = (
  walletId: string,
  accountPubKeyHex?: string,
): string => {
  // Prefer accountPubKeyHex if available for deterministic wallet IDs
  const source = accountPubKeyHex || walletId

  // If source is already hex (like accountPubKeyHex), use it directly
  // Otherwise, treat it as UTF-8 string (like UUID)
  const isHex = /^[0-9a-fA-F]+$/.test(source.replace(/-/g, ''))
  const normalizedSource = source.replace(/-/g, '')

  // Hash using SHA256 and take first 56 hex characters (28 bytes)
  const hash = QuickCrypto.createHash('sha256')
    .update(normalizedSource, isHex ? 'hex' : 'utf8')
    .digest('hex')
  return hash.slice(0, 56)
}

/**
 * Extract payment key hashes from addresses
 */
export const extractPaymentKeyHashes = (addresses: string[]): string[] => {
  const hashes = new Set<string>()

  for (const address of addresses) {
    try {
      const keyHash = getSpendingKey(address)
      if (keyHash) {
        hashes.add(keyHash)
      }
    } catch {
      // Skip addresses where we can't extract key hash
      continue
    }
  }

  return Array.from(hashes)
}

export {getBackendZeroUrl}

/**
 * In-memory cache for wallet registrations (per session)
 * Map<walletId, Set<backendZeroUrl>>
 */
const registrationCache = new Map<string, Set<string>>()

/**
 * Check if wallet can be registered with backend-zero
 * Requires: wallet ID and at least one address
 */
export const canRegisterWallet = (wallet: {
  id: string
  publicKeyHex?: string
  accountPubKeyHex?: string
  externalAddresses: string[]
  internalAddresses: string[]
}): boolean => {
  // Can register if we have:
  // 1. Wallet ID (required, also used as publicKey fallback)
  // 2. At least one address (to extract payment key hashes)
  // NOTE: publicKey field can be wallet ID if no public key available
  // This works because PATCH won't be implemented (no signature verification needed)
  return !!(
    wallet.id &&
    (wallet.externalAddresses.length > 0 || wallet.internalAddresses.length > 0)
  )
}

/**
 * Get wallet registration data from wallet info
 * Returns null if wallet cannot be registered
 */
export const getWalletRegistrationData = (wallet: {
  id: string
  publicKeyHex?: string
  accountPubKeyHex?: string
  externalAddresses: string[]
  internalAddresses: string[]
  rewardAddressHex?: string
}): WalletRegistrationData | null => {
  if (!canRegisterWallet(wallet)) {
    return null
  }

  const allAddresses = [
    ...wallet.externalAddresses,
    ...wallet.internalAddresses,
  ]
  const paymentKeyHashes = extractPaymentKeyHashes(allAddresses)
  const rewardAddresses = wallet.rewardAddressHex
    ? [wallet.rewardAddressHex]
    : []

  // Use publicKeyHex if available, otherwise accountPubKeyHex, otherwise wallet ID
  // NOTE: publicKey is only used for signature verification in PATCH endpoint.
  // Since PATCH won't be implemented, any hex string works for our use case.
  // For read-only wallets without a proper public key, we use wallet ID.
  const publicKey = wallet.publicKeyHex || wallet.accountPubKeyHex || wallet.id

  // Convert wallet ID to Ed25519KeyHash format (56 hex characters) as required by backend
  const backendWalletId = convertWalletIdToEd25519KeyHash(
    wallet.id,
    wallet.accountPubKeyHex,
  )

  return {
    id: backendWalletId,
    paymentKeyHashes,
    rewardAddresses,
    publicKey,
  }
}

/**
 * Get wallet registration data from wallet context (already has paymentKeyHashes extracted)
 * Returns null if wallet cannot be registered
 */
export const getWalletRegistrationDataFromContext = (context: {
  walletId: string
  publicKeyHex?: string
  accountPubKeyHex?: string
  paymentKeyHashes: string[]
  rewardAddresses: string[]
}): WalletRegistrationData | null => {
  if (!context.walletId || context.paymentKeyHashes.length === 0) {
    return null
  }

  // Use publicKeyHex if available, otherwise accountPubKeyHex, otherwise wallet ID
  // NOTE: publicKey is only used for signature verification in PATCH endpoint.
  // Since PATCH won't be implemented, any hex string works for our use case.
  // For read-only wallets without a proper public key, we use wallet ID.
  const publicKey =
    context.publicKeyHex || context.accountPubKeyHex || context.walletId

  // Convert wallet ID to Ed25519KeyHash format (56 hex characters) as required by backend
  const backendWalletId = convertWalletIdToEd25519KeyHash(
    context.walletId,
    context.accountPubKeyHex,
  )

  return {
    id: backendWalletId,
    paymentKeyHashes: context.paymentKeyHashes,
    rewardAddresses: context.rewardAddresses,
    publicKey,
  }
}

/**
 * Register wallet with backend-zero (idempotent - safe to call multiple times)
 * Uses in-memory cache to avoid spamming the endpoint within the same session
 * Returns true if registration succeeded, false otherwise
 *
 * NOTE: publicKey field is only used for signature verification in PATCH endpoint.
 * Since PATCH won't be implemented, any hex string works for our use case.
 * For read-only wallets without a proper public key, wallet ID is used.
 */
export const registerWallet = async (
  walletData: WalletRegistrationData,
  backendZeroUrl: string,
): Promise<boolean> => {
  // Check cache first
  if (registrationCache.has(walletData.id)) {
    const registeredUrls = registrationCache.get(walletData.id)!
    if (registeredUrls.has(backendZeroUrl)) {
      return true // Already registered in this session
    }
  }

  try {
    const response = await fetch(`${backendZeroUrl}/wallets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: walletData.id,
        paymentKeyHashes: walletData.paymentKeyHashes,
        rewardAddresses: walletData.rewardAddresses,
        publicKey: walletData.publicKey,
      }),
    })

    // 201 = created, 409 = already exists (both are success)
    if (response.status === 201 || response.status === 409) {
      // Cache successful registration
      if (!registrationCache.has(walletData.id)) {
        registrationCache.set(walletData.id, new Set())
      }
      registrationCache.get(walletData.id)!.add(backendZeroUrl)
      return true
    }

    // Other status codes = error
    return false
  } catch {
    // On error, return false (caller can fall back to legacy API)
    return false
  }
}

/**
 * Clear registration cache for a wallet (useful for testing or wallet deletion)
 */
export const clearRegistrationCache = (walletId: string): void => {
  registrationCache.delete(walletId)
}

/**
 * Check if wallet is registered (by attempting to get it)
 * Note: walletId should be in Ed25519KeyHash format (56 hex characters)
 */
export const isWalletRegistered = async (
  walletId: string,
  backendZeroUrl: string,
  accountPubKeyHex?: string,
): Promise<boolean> => {
  try {
    // Convert to Ed25519KeyHash format if needed
    const backendWalletId = convertWalletIdToEd25519KeyHash(
      walletId,
      accountPubKeyHex,
    )
    const response = await fetch(
      `${backendZeroUrl}/wallets/${backendWalletId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    return response.status === 200
  } catch {
    return false
  }
}
