import * as React from 'react'

import {YoroiWallet} from '../../../cardano/types'
import {useWallet} from '../../../hooks'

export const usePortfolioLocks = (wallet: YoroiWallet) => {
  useWallet(wallet, 'utxos')

  return React.useMemo(() => {
    return wallet.portfolio.primary.locks[wallet.primaryTokenInfo.id]
  }, [wallet.portfolio.primary.locks, wallet.primaryTokenInfo.id])
}
