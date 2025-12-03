import {YoroiWallet} from '@yoroi/cardano-wallet/types'

import * as React from 'react'

export const useStakingKey = (wallet: YoroiWallet): string => {
  return React.useMemo(() => {
    return wallet.getStakingKey().hash().toHex()
  }, [wallet])
}
