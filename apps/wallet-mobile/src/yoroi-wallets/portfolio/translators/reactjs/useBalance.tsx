import {Portfolio} from '@yoroi/types'
import * as React from 'react'

import {YoroiWallet} from '../../../cardano/types'
import {useWallet} from '../../../hooks'
import {Balances} from '../../helpers/balances'

export const useBalance = (wallet: YoroiWallet, id: Portfolio.TokenInfo['id']) => {
  useWallet(wallet, 'utxos')

  return React.useMemo(() => {
    return Balances.findById(wallet.balances, id)
  }, [id, wallet.balances])
}
