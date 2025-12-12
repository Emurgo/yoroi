/**
 * Branded types for type-safe strings, numbers, and bytes
 * 
 * This module provides branded types to prevent mixing up different
 * string/number types (e.g., addresses, token IDs, amounts, etc.)
 * 
 * Usage:
 * - Use type assertions (`as Type`) for internal code paths (no validation)
 * - Use validation functions (`asType()`) for external/user input paths
 */

export * from './utils'
export * from './address'
export * from './token'
export * from './amount'
export * from './transaction'
export * from './crypto'
export * from './cbor'
export * from './governance'

// Re-export constants
export {ZERO_QUANTITY} from './amount'

