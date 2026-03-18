import {BigNumber} from 'bignumber.js'

import type {AddressAllocation, Thaw} from '../types'

// NIGHT token has 6 decimals
export const NIGHT_DECIMALS = 6

/**
 * Format NIGHT token amount from raw amount (with decimals) to human-readable format
 * @param amount - Raw amount with 6 decimals
 * @returns Formatted amount string with 2 decimal places
 */
export const formatAmount = (amount: number): string => {
  const normalizationFactor = Math.pow(10, NIGHT_DECIMALS)
  const normalized = new BigNumber(amount).dividedBy(normalizationFactor)
  return normalized.toFormat(2)
}

/**
 * Check if a thaw can be redeemed right now
 * A thaw is redeemable if:
 * 1. Backend marked it as 'redeemable', OR
 * 2. Thaw period has started and status suggests it should be redeemable (upcoming/queued but not redeemed)
 *
 * @param thaw - The thaw to check
 * @param now - Current date (defaults to new Date())
 * @returns true if the thaw can be redeemed
 */
export const isThawRedeemable = (
  thaw: Thaw,
  now: Date = new Date(),
): boolean => {
  const thawDate = new Date(thaw.thawing_period_start.replace(/\s/g, ''))
  const hasStarted = thawDate <= now
  const isRedeemable = thaw.status === 'redeemable'
  const isPendingRedeemable =
    thaw.status === 'upcoming' || thaw.status === 'queued'
  const isNotRedeemed =
    thaw.status !== 'confirmed' &&
    thaw.status !== 'confirming' &&
    thaw.status !== 'submitted' &&
    thaw.status !== 'failed'

  return isRedeemable || (hasStarted && isPendingRedeemable && isNotRedeemed)
}

/**
 * Calculate the total redeemable amount from an array of thaws
 * @param thaws - Array of thaws to check
 * @returns Sum of amounts for redeemable thaws
 */
export const calculateRedeemableAmount = (
  thaws: ReadonlyArray<Thaw>,
): number => {
  const now = new Date()
  return thaws.reduce((sum, thaw) => {
    if (isThawRedeemable(thaw, now)) {
      return sum + thaw.amount
    }
    return sum
  }, 0)
}

/**
 * Check if client-side escrow redeem can be used for this allocation.
 * Returns true when any thaw with index > 0 has a past date but is not confirmed/confirming.
 * The first thaw (index 0) always requires the Midnight API for the Merkle proof.
 */
export const canUseClientSideRedeem = (
  allocation: AddressAllocation,
): boolean => {
  const now = new Date()
  const thaws = allocation.schedule.thaws

  // Need at least 2 thaws and first thaw must be confirmed
  if (thaws.length < 2) return false

  const firstThaw = thaws[0]
  if (!firstThaw || firstThaw.status !== 'confirmed') return false

  // Check if any subsequent thaw is past its date and not yet successfully claimed
  return thaws.some((thaw, index) => {
    if (index === 0) return false
    const thawDate = new Date(thaw.thawing_period_start.replace(/\s/g, ''))
    const hasStarted = thawDate <= now
    const isNotClaimed =
      thaw.status !== 'confirmed' && thaw.status !== 'confirming'
    return hasStarted && isNotClaimed
  })
}
