import type {Gradient, HexColor, ThemedPalette} from '@yoroi/theme'

import type {ThawStatus} from '../types'

export type ThawStatusInfo = {
  label: string
  color: Gradient | HexColor
  backgroundColor: HexColor // For View backgroundColor (solid color only)
  icon?: 'check' | 'close' | 'clock' | 'pending'
  description?: string
}

/**
 * Get status information for a thaw status
 * Returns appropriate label, color, and icon for UI display
 */
export const getThawStatusInfo = (
  status: ThawStatus,
  strings: {
    airdrop: {
      status: {
        redeemable: string
        submitted: string
        confirming: string
        failed: string
        queued: string
        skipped: string
      }
      redeemed: string
      noAvailableYet: string
    }
  },
  palette: ThemedPalette,
): ThawStatusInfo => {
  // Helper to extract solid color from palette value (gradient or hex)
  const getSolidColor = (value: HexColor | Gradient): HexColor => {
    return Array.isArray(value) ? value[0] : value
  }
  switch (status) {
    case 'confirmed':
      return {
        label: strings.airdrop.redeemed,
        color: palette.secondary_400,
        backgroundColor: getSolidColor(palette.primary_400),
        icon: 'check',
      }
    case 'confirming':
      return {
        label: strings.airdrop.status.confirming,
        color: palette.primary_400,
        backgroundColor: getSolidColor(palette.primary_400),
        icon: 'clock',
      }
    case 'submitted':
      return {
        label: strings.airdrop.status.submitted,
        color: palette.sys_orange_500,
        backgroundColor: getSolidColor(palette.sys_orange_500),
        icon: 'clock',
      }
    case 'failed':
      return {
        label: strings.airdrop.status.failed,
        color: palette.sys_magenta_500,
        backgroundColor: getSolidColor(palette.sys_magenta_500),
        icon: 'close',
      }
    case 'redeemable':
      // For redeemable, use gradient for Badge but extract first color for View backgroundColor
      return {
        label: strings.airdrop.status.redeemable,
        color: palette.bg_gradient_4,
        backgroundColor: getSolidColor(palette.bg_gradient_4),
        icon: 'pending',
      }
    case 'queued':
      return {
        label: strings.airdrop.status.queued,
        color: palette.primary_300,
        backgroundColor: getSolidColor(palette.primary_300),
        icon: 'clock',
      }
    case 'skipped':
      return {
        label: strings.airdrop.status.skipped,
        color: palette.gray_400,
        backgroundColor: getSolidColor(palette.gray_400),
        icon: undefined,
      }
    case 'upcoming':
    default:
      return {
        label: strings.airdrop.noAvailableYet,
        color: palette.gray_600,
        backgroundColor: getSolidColor(palette.gray_600),
        icon: undefined,
      }
  }
}

/**
 * Check if a thaw status represents a completed state
 */
export const isThawCompleted = (status: ThawStatus): boolean => {
  return status === 'confirmed' || status === 'confirming'
}

/**
 * Check if a thaw status represents a failed state
 */
export const isThawFailed = (status: ThawStatus): boolean => {
  return status === 'failed'
}

/**
 * Check if a thaw status represents an in-progress state (submitted or confirming)
 */
export const isThawInProgress = (status: ThawStatus): boolean => {
  return status === 'submitted' || status === 'confirming'
}
