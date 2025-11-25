import {Links, Scan} from '@yoroi/types'

/**
 * Pending action that can be from either Yoroi links or Cardano standard links.
 * Actions are stored in context regardless of login/wallet state and processed
 * once prerequisites are met.
 */
export type PendingAction =
  | {source: 'yoroi'; action: Links.YoroiAction}
  | {source: 'cardano'; action: Scan.Action}

/**
 * Check if an action requires a wallet to be selected.
 * Some actions like restore-wallet work without a selected wallet.
 */
export const requiresWallet = (pendingAction: PendingAction): boolean => {
  if (pendingAction.source === 'cardano') {
    // restore-wallet doesn't require a wallet
    return pendingAction.action.action !== 'restore-wallet'
  }

  // All Yoroi actions require a wallet
  return true
}
