import * as React from 'react'

import {YoroiWallet} from '~/wallets/cardano/types'

export const useStakingKey = (wallet: YoroiWallet): string => {
  return React.useMemo(() => {
    return wallet.getStakingKey().hash()
  }, [wallet])
}
