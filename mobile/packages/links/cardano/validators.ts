/**
 * Validation utilities for Cardano URI parameters
 * Based on cardano-uri-parser validation logic
 */

/**
 * Validates if a string is a valid 64-character hexadecimal value
 */
export const isValidHex64 = (value: string): boolean => {
  return /^[0-9a-fA-F]{64}$/.test(value)
}

/**
 * Validates if a string is a valid block height (non-negative integer)
 */
export const isValidBlockHeight = (value: string): boolean => {
  return /^[0-9]+$/.test(value) && Number(value) >= 0
}

/**
 * Validates if a string is a valid metadata label (numeric string)
 */
export const isValidMetadataLabel = (value: string): boolean => {
  return /^[0-9]+$/.test(value)
}

/**
 * Validates if a string is a valid URI scheme
 * Scheme must start with a letter and contain only alphanumeric, +, ., or - characters
 */
export const validateScheme = (scheme: string): boolean => {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*$/.test(scheme)
}

/**
 * Validates if a string is a valid namespaced domain
 * Must contain at least one dot (.)
 */
export const validateNamespacedDomain = (domain: string): boolean => {
  return domain.includes('.')
}

/**
 * Validates if a string is a valid transaction hash (64-char hex or "self")
 */
export const validateTransactionHash = (hash: string): boolean => {
  return hash === 'self' || isValidHex64(hash)
}

/**
 * Validates if a string is a valid block hash (64-char hex)
 */
export const validateBlockHash = (hash: string): boolean => {
  return isValidHex64(hash)
}

/**
 * Validates if a string is a valid BIP39 mnemonic phrase
 * Supports 12, 15, or 24 word mnemonics
 */
export const isValidMnemonic = (value: string): boolean => {
  try {
    // Import validateMnemonic from bip39 dynamically to avoid dependency issues
    // For now, do basic validation: check word count and basic format
    const words = value.trim().split(/\s+/).filter(Boolean)
    const validLengths = [12, 15, 24]
    if (!validLengths.includes(words.length)) {
      return false
    }
    // Basic check: all words should be non-empty strings
    return words.every((word) => word.length > 0)
  } catch {
    return false
  }
}

/**
 * Validates if a string is a valid hexadecimal key
 * @param value - The hex string to validate
 * @param expectedLength - Optional expected byte length (will check hex length = expectedLength * 2)
 */
export const isValidHexKey = (
  value: string,
  expectedLength?: number,
): boolean => {
  const hexRegex = /^[0-9a-fA-F]+$/
  if (!hexRegex.test(value)) {
    return false
  }
  if (expectedLength !== undefined) {
    return value.length === expectedLength * 2
  }
  return value.length > 0
}
