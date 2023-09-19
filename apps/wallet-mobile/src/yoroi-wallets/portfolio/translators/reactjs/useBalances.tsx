import * as React from 'react'

import {YoroiWallet} from '../../../cardano/types'
import {useWallet} from '../../../hooks'

export const useBalances = (wallet: YoroiWallet) => {
  useWallet(wallet, 'utxos')

  return React.useMemo(() => {
    return wallet.balances
  }, [wallet.balances])
}
