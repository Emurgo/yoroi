import {useObservableValue} from '@yoroi/common'
import * as React from 'react'
import {filter} from 'rxjs'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {filterBySyncEvent as isSyncEvent} from '../helpers/filterBySyncEvent'

export const usePortfolioPrimaryBreakdown = ({wallet}: {wallet: YoroiWallet}) => {
  const observable$ = React.useMemo(() => wallet.balance$.pipe(filter(isSyncEvent)), [wallet])
  const executor = React.useCallback(() => wallet.primaryBreakdown, [wallet])

  return useObservableValue({
    observable$,
    executor,
  })
}
