import {String} from './utils'

/**
 * Base address type (validated, format-agnostic, purpose-agnostic)
 * Use this as the default address type throughout the codebase.
 */
export type Address = String<'Address'>

/**
 * Format-specific address types
 * Use these only when you need to enforce a specific format (e.g., conversion functions)
 */
export type AddressBech32 = String<'AddressBech32'> // e.g., "addr1...", "stake1..."
export type AddressHex = String<'AddressHex'> // Base16 encoded
export type AddressBase58 = String<'AddressBase58'> // Byron addresses

/**
 * Address purpose types
 * Use these only when a function specifically requires a payment or staking address
 * Note: These are purpose-specific, not format-specific. A PaymentAddress can be in any format.
 */
export type PaymentAddress = String<'PaymentAddress'> // Payment addresses (any format)
export type StakingAddress = String<'StakingAddress'> // Staking/reward addresses (any format)
