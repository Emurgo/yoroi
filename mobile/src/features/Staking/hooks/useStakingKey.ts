import * as React from 'react'

import {YoroiWallet} from '@yoroi/cardano-wallet/types'

export const useStakingKey = (wallet: YoroiWallet): string => {
  return React.useMemo(() => {
    return wallet.getStakingKey().hash().toHex()
  }, [wallet])
}
