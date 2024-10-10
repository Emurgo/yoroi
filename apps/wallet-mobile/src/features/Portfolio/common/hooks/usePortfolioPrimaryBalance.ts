import {useObservableValue} from '@yoroi/common'
import * as React from 'react'
import {filter} from 'rxjs'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {filterBySyncEvent as isSyncEvent} from '../helpers/filter-by-sync-event'

export const usePortfolioPrimaryBalance = ({wallet}: {wallet: YoroiWallet}) => {
  const observable$ = React.useMemo(() => wallet.balance$.pipe(filter(isSyncEvent)), [wallet])
  const getter = React.useCallback(() => wallet.primaryBalance, [wallet])

  return useObservableValue({
    observable$,
    getter,
  })
}
