import {Portfolio} from '@yoroi/types'
import * as React from 'react'

import {YoroiWallet} from '../../../cardano/types'
import {useWallet} from '../../../hooks'
import {Amounts, Quantities} from '../../../utils'
import {Balances} from '../../helpers/balances'

export const useHasNoBalance = (wallet: YoroiWallet) => {
  useWallet(wallet, 'utxos')

  return React.useMemo(() => {
    const amounts = Balances.asAmounts(wallet.balances)
    return Amounts.toArray(amounts).every(isZero)
  }, [wallet.balances])
}

function isZero({quantity}: Portfolio.Amount) {
  return Quantities.isZero(quantity)
}
