import {parseSafe, useAsyncStorage} from '@yoroi/common'
import React from 'react'
import {useMutation, UseMutationOptions, useQuery, useQueryClient} from 'react-query'

import {configCurrencies, supportedCurrencies} from '../../../../../kernel/constants'
import {usePrimaryTokenActivity} from '../../../../../yoroi-wallets/cardano/usePrimaryTokenActivity'
import {ConfigCurrencies, CurrencySymbol} from '../../../../../yoroi-wallets/types/other'

const CurrencyContext = React.createContext<undefined | CurrencyContext>(undefined)
export const CurrencyProvider = ({children}: {children: React.ReactNode}) => {
  const currency = useCurrency()
  const selectCurrency = useSaveCurrency()
  const {ptActivity, isLoading} = usePrimaryTokenActivity({to: currency})
  const value = React.useMemo(
    () => ({
      currency,
      selectCurrency,
      supportedCurrencies,
      configCurrencies,
      config: configCurrencies[currency],
      ptActivity,
      isLoading,
    }),
    [currency, selectCurrency, ptActivity, isLoading],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export const useCurrencyPairing = () => React.useContext(CurrencyContext) || missingProvider()

const missingProvider = () => {
  throw new Error('CurrencyProvider is missing')
}

const useCurrency = () => {
  const storage = useAsyncStorage()
  const query = useQuery<CurrencySymbol, Error>({
    queryKey: ['currencySymbol'],
    queryFn: async () => {
      const currencySymbol = await storage.join('appSettings/').getItem('currencySymbol', parseCurrencySymbol)

      if (currencySymbol != null) {
        const stillSupported = Object.values(supportedCurrencies).includes(currencySymbol)
        if (stillSupported) return currencySymbol
      }

      return defaultCurrency
    },
  })

  return query.data ?? defaultCurrency
}

const useSaveCurrency = ({onSuccess, ...options}: UseMutationOptions<void, Error, CurrencySymbol> = {}) => {
  const queryClient = useQueryClient()
  const storage = useAsyncStorage()

  const mutation = useMutation({
    mutationFn: (currencySymbol) => storage.join('appSettings/').setItem('currencySymbol', currencySymbol),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['currencySymbol'])
      onSuccess?.(data, variables, context)
    },
    ...options,
  })

  return mutation.mutate
}

const defaultCurrency: CurrencySymbol = supportedCurrencies.USD
type SaveCurrencySymbol = ReturnType<typeof useSaveCurrency>
type CurrencyContext = {
  currency: CurrencySymbol
  selectCurrency: SaveCurrencySymbol
  config: {decimals: number; nativeName: string}

  supportedCurrencies: typeof supportedCurrencies
  configCurrencies: ConfigCurrencies
  ptActivity: {
    ts: number
    close: number
    open: number
  }
  isLoading: boolean
}

const parseCurrencySymbol = (data: unknown) => {
  const isCurrencySymbol = (data: unknown): data is CurrencySymbol =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.values(supportedCurrencies).includes(data as any)

  const parsed = parseSafe(data)

  return isCurrencySymbol(parsed) ? parsed : undefined
}
