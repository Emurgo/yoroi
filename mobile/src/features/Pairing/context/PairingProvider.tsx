import {invalid, useSyncStorageToState} from '@yoroi/common'
import {configCurrencies} from '@yoroi/portfolio'
import {App, Portfolio} from '@yoroi/types'

import * as React from 'react'

import {usePrimaryTokenActivity} from '../hooks/usePrimaryTokenActivity'

export const PairingProvider = ({
  children,
  currencyStorageKeyManager,
}: React.PropsWithChildren<Props>) => {
  const [currency, selectCurrency] = useSyncStorageToState(
    currencyStorageKeyManager,
  )
  const {ptActivity, isLoading} = usePrimaryTokenActivity({to: currency})

  return (
    <PairingContext.Provider
      value={{
        currency,
        selectCurrency,
        config: configCurrencies[currency],
        ptActivity,
        isLoading,
      }}
    >
      {children}
    </PairingContext.Provider>
  )
}

const PairingContext = React.createContext<undefined | PairingContext>(
  undefined,
)

export const usePairing = () =>
  React.useContext(PairingContext) || invalid('usePairing: missing provider')

type Props = {
  currencyStorageKeyManager: App.StorageKeyManager<Portfolio.Currency.Symbol>
}

type PairingContext = {
  currency: Portfolio.Currency.Symbol
  selectCurrency(currency: Portfolio.Currency.Symbol): void
  config: Portfolio.Currency.Config
  ptActivity: {
    ts: number
    close: number
    open: number
  }
  isLoading: boolean
}
