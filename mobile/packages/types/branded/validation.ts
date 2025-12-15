/**
 * Validation functions for branded types
 *
 * These functions use lenient validation - they always return branded types
 * but log warnings if the format seems invalid. This ensures existing code
 * continues to work while providing type safety.
 */
import {getLogger} from '@yoroi/logger'

import type {
  Address,
  AddressBase58,
  AddressBech32,
  AddressHex,
  Amount,
  AmountFormatted,
  AmountRaw,
  AmountSanitized,
  AnchorHash,
  AnchorUrl,
  AssetName,
  BalanceQuantity,
  Blake2bHash,
  BlockHash,
  CborHex,
  DRepId,
  DatumCbor,
  DatumHash,
  EpochNumber,
  GovernanceActionId,
  KeyHash,
  MetadataCbor,
  PaymentAddress,
  PolicyId,
  PrivateKeyHex,
  PublicKeyHex,
  ScriptCbor,
  ScriptHash,
  Sha256Hash,
  SignatureHex,
  SlotNumber,
  StakingAddress,
  TokenFingerprint,
  TokenId,
  TransactionCbor,
  TransactionCborBase64,
  TransactionCborHex,
  TransactionHash,
  UtxoId,
} from './index'

// Helper to check if string is hex
const isHex = (str: string): boolean => /^[0-9a-fA-F]+$/.test(str)

// Helper to check if string looks like bech32
const isBech32Like = (str: string): boolean => {
  return /^[a-z0-9]+1[a-z0-9]+$/i.test(str)
}

// Helper to check if string looks like base58
const isBase58Like = (str: string): boolean => {
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(str)
}

// Address validation
export const asAddress = (input: string): Address => {
  if (!input || typeof input !== 'string' || input.length === 0) {
    getLogger().warn(`[BrandedType] Invalid address: empty or non-string`)
  }
  return input as Address
}

export const asAddressBech32 = (input: string): AddressBech32 => {
  if (!isBech32Like(input)) {
    getLogger().warn(`[BrandedType] Invalid bech32 address format: ${input}`)
  }
  return input as AddressBech32
}

export const asAddressHex = (input: string): AddressHex => {
  if (!isHex(input)) {
    getLogger().warn(`[BrandedType] Invalid hex address format: ${input}`)
  }
  return input as AddressHex
}

export const asAddressBase58 = (input: string): AddressBase58 => {
  if (!isBase58Like(input)) {
    getLogger().warn(`[BrandedType] Invalid base58 address format: ${input}`)
  }
  return input as AddressBase58
}

export const asPaymentAddress = (input: string): PaymentAddress => {
  if (!input || typeof input !== 'string') {
    getLogger().warn(`[BrandedType] Invalid payment address: ${input}`)
  }
  return input as PaymentAddress
}

export const asStakingAddress = (input: string): StakingAddress => {
  if (!input || typeof input !== 'string') {
    getLogger().warn(`[BrandedType] Invalid staking address: ${input}`)
  }
  return input as StakingAddress
}

// Conversion helpers: Address <-> Format-specific types
// These allow converting between Address and format-specific types
export const addressToBech32 = (addr: Address): AddressBech32 =>
  addr as unknown as AddressBech32
export const addressToHex = (addr: Address): AddressHex =>
  addr as unknown as AddressHex
export const addressToBase58 = (addr: Address): AddressBase58 =>
  addr as unknown as AddressBase58
export const bech32ToAddress = (addr: AddressBech32): Address =>
  addr as unknown as Address
export const hexToAddress = (addr: AddressHex): Address =>
  addr as unknown as Address
export const base58ToAddress = (addr: AddressBase58): Address =>
  addr as unknown as Address

// Conversion helpers: Address <-> Purpose-specific types
// These allow converting between Address and purpose-specific types
export const addressToPayment = (addr: Address): PaymentAddress =>
  addr as unknown as PaymentAddress
export const addressToStaking = (addr: Address): StakingAddress =>
  addr as unknown as StakingAddress
export const paymentToAddress = (addr: PaymentAddress): Address =>
  addr as unknown as Address
export const stakingToAddress = (addr: StakingAddress): Address =>
  addr as unknown as Address

// Token validation
export const asTokenId = (input: string): TokenId => {
  if (!input || typeof input !== 'string') {
    getLogger().warn(`[BrandedType] Invalid token ID: ${input}`)
  }
  return input as TokenId
}

// PortfolioTokenId is an alias for TokenId, so use the same validation function
export const asPortfolioTokenId = asTokenId

export const asPolicyId = (input: string): PolicyId => {
  // Empty string is valid for primary token (ADA/lovelace)
  // Otherwise, must be exactly 56 hex chars (28 bytes)
  if (input !== '' && (!isHex(input) || input.length !== 56)) {
    getLogger().warn(
      `[BrandedType] Invalid policy ID format (expected empty string or 56 hex chars): ${input}`,
    )
  }
  return input as PolicyId
}

export const asAssetName = (input: string): AssetName => {
  // Empty string is valid for primary token (ADA/lovelace)
  // Otherwise, must be valid hex
  if (input !== '' && !isHex(input)) {
    getLogger().warn(`[BrandedType] Invalid asset name hex format: ${input}`)
  }
  return input as AssetName
}

export const asTokenFingerprint = (input: string): TokenFingerprint => {
  // Token fingerprint is typically a bech32-encoded string (asset1...)
  // Basic validation - just check it's a non-empty string
  if (!input || typeof input !== 'string' || input.length === 0) {
    getLogger().warn(`[BrandedType] Invalid token fingerprint: ${input}`)
  }
  return input as TokenFingerprint
}

// Amount validation
// @deprecated Use asBalanceQuantity instead
export const asAmount = (input: string): Amount => {
  return asBalanceQuantity(input)
}

export const asAmountRaw = (input: string): AmountRaw => {
  // Always accepts - this is for unvalidated user input
  return input as AmountRaw
}

export const asAmountSanitized = (input: string): AmountSanitized => {
  // Sanitized input - should be cleaned but not validated
  return input as AmountSanitized
}

export const asAmountFormatted = (input: string): AmountFormatted => {
  // Formatted for display - should have locale formatting applied
  return input as AmountFormatted
}

export const asBalanceQuantity = (input: string): BalanceQuantity => {
  if (!input || typeof input !== 'string') {
    getLogger().warn(`[BrandedType] Invalid balance quantity: ${input}`)
  }
  return input as BalanceQuantity
}

// Transaction validation
export const asTransactionHash = (input: string): TransactionHash => {
  if (!isHex(input) || input.length !== 64) {
    getLogger().warn(
      `[BrandedType] Invalid transaction hash format (expected 64 hex chars): ${input}`,
    )
  }
  return input as TransactionHash
}

export const asUtxoId = (input: string | UtxoId): UtxoId => {
  if (typeof input === 'string') {
    return input as UtxoId
  }
  return input
}

export const asUtxoIdFromParts = (
  txHash: TransactionHash,
  index: number,
): UtxoId => {
  const txHashStr = typeof txHash === 'string' ? txHash : txHash
  const utxoId = `${txHashStr}:${index}` as UtxoId
  return utxoId
}

export const asBlockHash = (input: string): BlockHash => {
  if (!isHex(input)) {
    getLogger().warn(`[BrandedType] Invalid block hash format: ${input}`)
  }
  return input as BlockHash
}

export const asSlotNumber = (input: number): SlotNumber => {
  if (typeof input !== 'number' || input < 0 || !Number.isInteger(input)) {
    getLogger().warn(`[BrandedType] Invalid slot number: ${input}`)
  }
  return input as SlotNumber
}

export const asEpochNumber = (input: number): EpochNumber => {
  if (typeof input !== 'number' || input < 0 || !Number.isInteger(input)) {
    getLogger().warn(`[BrandedType] Invalid epoch number: ${input}`)
  }
  return input as EpochNumber
}

// Cryptographic validation
export const asPublicKeyHex = (input: string): PublicKeyHex => {
  // Accept both regular Ed25519 public keys (64 hex chars = 32 bytes)
  // and extended BIP32-Ed25519 public keys (128 hex chars = 64 bytes)
  if (!isHex(input) || (input.length !== 64 && input.length !== 128)) {
    getLogger().warn(
      `[BrandedType] Invalid public key hex format (expected 64 or 128 hex chars): ${input}`,
    )
  }
  return input as PublicKeyHex
}

export const asPrivateKeyHex = (input: string): PrivateKeyHex => {
  if (!isHex(input)) {
    getLogger().warn(`[BrandedType] Invalid private key hex format: ${input}`)
  }
  return input as PrivateKeyHex
}

export const asKeyHash = (input: string): KeyHash => {
  if (!isHex(input) || input.length !== 56) {
    getLogger().warn(
      `[BrandedType] Invalid key hash format (expected 56 hex chars): ${input}`,
    )
  }
  return input as KeyHash
}

export const asSignatureHex = (input: string): SignatureHex => {
  if (!isHex(input) || input.length !== 128) {
    getLogger().warn(
      `[BrandedType] Invalid signature hex format (expected 128 hex chars): ${input}`,
    )
  }
  return input as SignatureHex
}

// Hash validation
export const asBlake2bHash = (input: string): Blake2bHash => {
  if (!isHex(input)) {
    getLogger().warn(`[BrandedType] Invalid Blake2b hash format: ${input}`)
  }
  return input as Blake2bHash
}

export const asSha256Hash = (input: string): Sha256Hash => {
  if (!isHex(input) || input.length !== 64) {
    getLogger().warn(
      `[BrandedType] Invalid SHA-256 hash format (expected 64 hex chars): ${input}`,
    )
  }
  return input as Sha256Hash
}

export const asDatumHash = (input: string): DatumHash => {
  if (!isHex(input)) {
    getLogger().warn(`[BrandedType] Invalid datum hash format: ${input}`)
  }
  return input as DatumHash
}

export const asScriptHash = (input: string): ScriptHash => {
  if (!isHex(input)) {
    getLogger().warn(`[BrandedType] Invalid script hash format: ${input}`)
  }
  return input as ScriptHash
}

// CBOR validation
export const asCborHex = (input: string): CborHex => {
  if (!isHex(input)) {
    getLogger().warn(`[BrandedType] Invalid CBOR hex format: ${input}`)
  }
  return input as CborHex
}

export const asMetadataCbor = (input: string): MetadataCbor => {
  if (!isHex(input)) {
    getLogger().warn(`[BrandedType] Invalid metadata CBOR format: ${input}`)
  }
  return input as MetadataCbor
}

export const asScriptCbor = (input: string): ScriptCbor => {
  if (!isHex(input)) {
    getLogger().warn(`[BrandedType] Invalid script CBOR format: ${input}`)
  }
  return input as ScriptCbor
}

export const asDatumCbor = (input: string): DatumCbor => {
  if (!isHex(input)) {
    getLogger().warn(`[BrandedType] Invalid datum CBOR format: ${input}`)
  }
  return input as DatumCbor
}

// Helper to check if string is base64
const isBase64 = (str: string): boolean => {
  if (str.length === 0) return false
  const cleaned = str.replace(/\s/g, '')
  // If it's hex, it's not base64 (hex is more restrictive)
  if (isHex(cleaned)) return false
  // Base64 regex: allows A-Z, a-z, 0-9, +, /, and = for padding
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  // Base64 should have + or / characters, or proper padding (= or ==)
  const hasBase64Chars = /[+/]/.test(cleaned) || /[=]{1,2}$/.test(cleaned)
  return base64Regex.test(cleaned) && hasBase64Chars
}

/**
 * Validate hex-encoded transaction CBOR (for internal use)
 */
export const asTransactionCborHex = (input: string): TransactionCborHex => {
  if (!isHex(input)) {
    getLogger().warn(
      `[BrandedType] Invalid transaction CBOR hex format: ${input.substring(0, 100)}...`,
    )
  }
  return input as TransactionCborHex
}

/**
 * Validate base64-encoded transaction CBOR (for API submission)
 */
export const asTransactionCborBase64 = (
  input: string,
): TransactionCborBase64 => {
  if (!isBase64(input)) {
    getLogger().warn(
      `[BrandedType] Invalid transaction CBOR base64 format: ${input.substring(0, 100)}...`,
    )
  }
  return input as TransactionCborBase64
}

/**
 * @deprecated Use asTransactionCborHex or asTransactionCborBase64 instead
 * Legacy function - validates as hex for backward compatibility
 */
export const asTransactionCbor = (input: string): TransactionCbor => {
  return asTransactionCborHex(input)
}

// Governance validation
export const asDRepId = (input: string): DRepId => {
  if (!isHex(input)) {
    getLogger().warn(`[BrandedType] Invalid DRep ID format: ${input}`)
  }
  return input as DRepId
}

export const asGovernanceActionId = (input: string): GovernanceActionId => {
  if (!input || typeof input !== 'string') {
    getLogger().warn(`[BrandedType] Invalid governance action ID: ${input}`)
  }
  return input as GovernanceActionId
}

export const asAnchorUrl = (input: string): AnchorUrl => {
  try {
    // eslint-disable-next-line no-new
    new URL(input)
  } catch {
    getLogger().warn(`[BrandedType] Invalid anchor URL format: ${input}`)
  }
  return input as AnchorUrl
}

export const asAnchorHash = (input: string): AnchorHash => {
  if (!isHex(input)) {
    getLogger().warn(`[BrandedType] Invalid anchor hash format: ${input}`)
  }
  return input as AnchorHash
}
