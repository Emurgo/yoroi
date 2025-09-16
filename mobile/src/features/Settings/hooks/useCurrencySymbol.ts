import {useSyncStorageToState} from '@yoroi/common'

import * as React from 'react'

import {currencyStorageKeyManager} from '~/kernel/storage/storages'

export const useCurrencySymbol = () => {
  const [currencySymbol, setCurrencySymbol, resetCurrencySymbol] =
    useSyncStorageToState(currencyStorageKeyManager)

  return React.useMemo(
    () => ({
      currencySymbol,
      setCurrencySymbol,
      resetCurrencySymbol,
    }),
    [currencySymbol, setCurrencySymbol, resetCurrencySymbol],
  )
}
