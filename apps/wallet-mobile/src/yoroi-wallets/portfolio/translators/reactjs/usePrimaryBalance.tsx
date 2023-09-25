import * as React from 'react'

import {YoroiWallet} from '../../../cardano/types'
import {useWallet} from '../../../hooks'
import {Balances} from '../../helpers/balances'

export const usePrimaryBalance = (wallet: YoroiWallet) => {
  useWallet(wallet, 'utxos')

  return React.useMemo(() => {
    return Balances.findById(wallet.balances, wallet.primaryTokenInfo.id)
  }, [wallet.balances, wallet.primaryTokenInfo.id])
}
