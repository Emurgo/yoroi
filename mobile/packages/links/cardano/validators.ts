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
