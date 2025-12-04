/**
 * Script derivation paths for multisig wallets
 * Based on CIP-1854 MULTI_SIG purpose
 */

/**
 * Payment script key derivation path
 * Role: External (0), Index: 0
 */
export const paymentScriptKeyPath = {
  role: 0, // External
  index: 0,
} as const

/**
 * Staking script key derivation path
 * Role: Stake (2), Index: 0
 */
export const stakingScriptKeyPath = {
  role: 2, // Stake
  index: 0,
} as const

/**
 * MULTI_SIG purpose value according to CIP-1854
 * Used to derive multisig accounts from parent wallets
 */
export const MULTI_SIG_PURPOSE = 2

/**
 * Derivation path structure for multisig accounts
 * Format: m/1852'/1815'/account'/2'/role/index
 * Where 2' is the MULTI_SIG purpose
 */
export type MultisigDerivationPath = {
  account: number
  purpose: typeof MULTI_SIG_PURPOSE
  role: number
  index: number
}
