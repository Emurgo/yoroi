import {YoroiWallet} from '@yoroi/cardano-wallet'

import * as React from 'react'

export const useStakingKey = (wallet: YoroiWallet): string => {
  return React.useMemo(() => {
    try {
      // Check if wallet implementation is Byron - they don't support staking
      // We can't access meta here, so we'll catch the error instead
      return wallet.getStakingKey().hash().toHex()
    } catch (error) {
      // Return empty string for Byron wallets or other errors
      return ''
    }
  }, [wallet])
}
