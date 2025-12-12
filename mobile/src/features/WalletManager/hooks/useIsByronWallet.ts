import {isByron} from '@yoroi/cardano-wallet'
import {isByronAddress} from '@yoroi/tx'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as React from 'react'

/**
 * Hook to check if the currently selected wallet is a Byron wallet
 * Checks both meta.implementation and wallet addresses as fallback
 * @returns true if the wallet is a Byron wallet, false otherwise
 */
export const useIsByronWallet = (): boolean => {
  const {meta, wallet} = useSelectedWallet()

  return React.useMemo(() => {
    // First check meta implementation (most reliable)
    if (meta && isByron(meta.implementation)) {
      return true
    }

    // Fallback: check addresses if meta doesn't have correct implementation
    // This handles cases where read-only wallets were created with wrong implementation
    if (wallet) {
      try {
        const addresses = wallet.receiveAddresses()
        const firstAddress = addresses?.[0]
        if (firstAddress && typeof firstAddress === 'string') {
          // Check first address - if it's Byron, the wallet is Byron
          return isByronAddress(firstAddress)
        }
      } catch {
        // If we can't get addresses, fall back to meta check
      }
    }

    return false
  }, [meta, wallet])
}
