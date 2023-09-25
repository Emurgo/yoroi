import * as React from 'react'

import {YoroiWallet} from '../../../cardano/types'
import {useWallet} from '../../../hooks'

export const usePortfolio = (wallet: YoroiWallet) => {
  useWallet(wallet, 'utxos')

  return React.useMemo(() => {
    return wallet.portfolio
  }, [wallet.portfolio])
}
