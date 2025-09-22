import {invalid} from '@yoroi/common'
import {configCurrencies} from '@yoroi/portfolio'
import {Portfolio} from '@yoroi/types'

import * as React from 'react'

import {usePrimaryTokenActivity} from '~/features/Pairing/hooks/usePrimaryTokenActivity'

import {useCurrencySymbol} from '../hooks/useCurrencySymbol'

const CurrencyContext = React.createContext<undefined | CurrencyContext>(
  undefined,
)

export const CurrencyProvider = ({children}: React.PropsWithChildren) => {
  const {currencySymbol, setCurrencySymbol} = useCurrencySymbol()

  const {isLoading, ptActivity} = usePrimaryTokenActivity({
    to: currencySymbol,
  })

  const value = React.useMemo(
    () => ({
      currency: currencySymbol,
      selectCurrency: setCurrencySymbol,
      configCurrencies,
      config: configCurrencies[currencySymbol],
      formatCurrency: formatCurrency(currencySymbol),
      ptActivity,
      isLoading,
    }),
    [currencySymbol, setCurrencySymbol, ptActivity, isLoading],
  )

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const formatCurrency =
  (currency: Portfolio.Currency.Symbol) => (value: number) => {
    return `${value.toFixed(configCurrencies[currency].decimals)} ${currency}`
  }

export const useCurrencyPairing = () =>
  React.useContext(CurrencyContext) || invalid('CurrencyProvider is missing')

type CurrencyContext = {
  currency: Portfolio.Currency.Symbol
  selectCurrency: (currency: Portfolio.Currency.Symbol) => void
  config: Portfolio.Currency.Config
  configCurrencies: Portfolio.Currency.ConfigBySymbol
  formatCurrency: (value: number) => string
  ptActivity: {
    ts: number
    close: number
    open: number
  }
  isLoading: boolean
}
