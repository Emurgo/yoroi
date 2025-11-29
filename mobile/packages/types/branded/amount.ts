import {String} from './utils'

/**
 * Amount types
 * @deprecated Amount is deprecated, use BalanceQuantity instead
 */
export type Amount = BalanceQuantity // Deprecated: use BalanceQuantity
export type AmountRaw = String<'AmountRaw'> // Unvalidated user input (directly from user)
export type AmountSanitized = String<'AmountSanitized'> // Sanitized user input (cleaned but not validated)
export type AmountFormatted = String<'AmountFormatted'> // Formatted for display (with locale formatting)
export type BalanceQuantity = String<'BalanceQuantity'> // Currently: `${number}` - atomic units as string
export type Lovelace = String<'Lovelace'> // ADA amount in lovelace

/**
 * Branded zero constant for Balance.Quantity
 * Use this instead of string literal '0' for type safety
 */
export const ZERO_QUANTITY: BalanceQuantity = '0' as BalanceQuantity
