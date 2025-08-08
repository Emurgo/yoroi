import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {parseSafe, useAsyncStorage} from '@yoroi/common'
import {configCurrencies} from '@yoroi/portfolio'
import {App, Portfolio} from '@yoroi/types'
import React from 'react'

// Create supportedCurrencies from configCurrencies keys
export const supportedCurrencies = Object.keys(
  configCurrencies,
) as Array<Portfolio.Currency.Symbol>

const CurrencyContext = React.createContext<undefined | CurrencyContext>(
  undefined,
)

export const CurrencyProvider = ({children}: {children: React.ReactNode}) => {
  const currency = useCurrency()
  const selectCurrency = useSaveCurrency()

  // TODO: Replace with actual usePrimaryTokenActivity hook when available
  const ptActivity = {
    ts: Date.now(),
    close: 0,
    open: 0,
  }
  const isLoading = false

  const value = React.useMemo(
    () => ({
      currency,
      selectCurrency,
      supportedCurrencies,
      configCurrencies,
      config: configCurrencies[currency as keyof typeof configCurrencies],
      ptActivity,
      isLoading,
    }),
    [currency, selectCurrency, ptActivity, isLoading],
  )

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrencyPairing = () =>
  React.useContext(CurrencyContext) || missingProvider()

const missingProvider = () => {
  throw new Error('CurrencyProvider is missing')
}

const useCurrency = () => {
  const storage = useAsyncStorage()
  const query = useQuery<Portfolio.Currency.Symbol, Error>({
    queryKey: ['currencySymbol'],
    queryFn: () => getCurrencySymbol(storage),
  })

  return query.data ?? defaultCurrency
}

export const getCurrencySymbol = async (storage: App.Storage) => {
  const currencySymbol = await storage
    .join('appSettings/')
    .getItem('currencySymbol', parseCurrencySymbol)

  if (currencySymbol != null) {
    const stillSupported =
      Object.values(supportedCurrencies).includes(currencySymbol)
    if (stillSupported) return currencySymbol
  }

  return defaultCurrency
}

export const formatCurrency = (
  value: number,
  currency: Portfolio.Currency.Symbol,
) => {
  return `${value.toFixed(configCurrencies[currency].decimals)} ${currency}`
}

const useSaveCurrency = ({
  onSuccess,
  ...options
}: UseMutationOptions<void, Error, Portfolio.Currency.Symbol> = {}) => {
  const queryClient = useQueryClient()
  const storage = useAsyncStorage()

  const mutation = useMutation({
    mutationFn: (currencySymbol: Portfolio.Currency.Symbol) =>
      storage.join('appSettings/').setItem('currencySymbol', currencySymbol),
    onSuccess: (
      data: void,
      variables: Portfolio.Currency.Symbol,
      context: unknown,
    ) => {
      queryClient.invalidateQueries({queryKey: ['currencySymbol']})
      onSuccess?.(data, variables, context)
    },
    ...options,
  })

  return mutation.mutate
}

const defaultCurrency: Portfolio.Currency.Symbol = 'USD'

type SaveCurrencySymbol = ReturnType<typeof useSaveCurrency>
type CurrencyContext = {
  currency: Portfolio.Currency.Symbol
  selectCurrency: SaveCurrencySymbol
  config: {decimals: number; nativeName: string}
  supportedCurrencies: typeof supportedCurrencies
  configCurrencies: typeof configCurrencies
  ptActivity: {
    ts: number
    close: number
    open: number
  }
  isLoading: boolean
}

const parseCurrencySymbol = (data: unknown) => {
  const isCurrencySymbol = (data: unknown): data is Portfolio.Currency.Symbol =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.values(supportedCurrencies).includes(data as any)

  const parsed = parseSafe(data)

  return isCurrencySymbol(parsed) ? parsed : undefined
}
