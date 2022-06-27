import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'
import {useMutation, UseMutationOptions, useQuery, useQueryClient} from 'react-query'

import {ConfigCurrencies, configCurrencies, CurrencySymbol, supportedCurrencies} from '../../legacy/types'

const CurrencyContext = React.createContext<undefined | CurrencyContext>(undefined)
export const CurrencyProvider: React.FC = ({children}) => {
  const currency = useCurrency()
  const selectCurrency = useSaveCurrency()
  const config = configCurrencies[currency]

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        selectCurrency,
        supportedCurrencies,
        configCurrencies,
        config,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrencyContext = () => React.useContext(CurrencyContext) || missingProvider()

const missingProvider = () => {
  throw new Error('CurrencyProvider is missing')
}

const useCurrency = () => {
  const query = useQuery<CurrencySymbol, Error>({
    initialData: defaultCurrency,
    queryKey: ['currencySymbol'],
    queryFn: async () => {
      const storedCurrencySymbol = await AsyncStorage.getItem('/appSettings/currencySymbol')

      if (storedCurrencySymbol) {
        const parsedCurrencySymbol = JSON.parse(storedCurrencySymbol)
        const stillSupported = Object.values(supportedCurrencies).includes(parsedCurrencySymbol)
        if (stillSupported) return parsedCurrencySymbol
      }

      return defaultCurrency
    },
    suspense: true,
  })

  if (!query.data) throw new Error('Invalid state')

  return query.data
}

const useSaveCurrency = ({onSuccess, ...options}: UseMutationOptions<void, Error, CurrencySymbol> = {}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (currencySymbol) =>
      AsyncStorage.setItem('/appSettings/currencySymbol', JSON.stringify(currencySymbol)),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries('currencySymbol')
      onSuccess?.(data, variables, context)
    },
    ...options,
  })

  return mutation.mutate
}

const defaultCurrency = supportedCurrencies.USD as CurrencySymbol
type SaveCurrencySymbol = ReturnType<typeof useSaveCurrency>
type CurrencyContext = {
  currency: CurrencySymbol
  selectCurrency: SaveCurrencySymbol
  config: {decimals: number; nativeName: string}

  supportedCurrencies: typeof supportedCurrencies
  configCurrencies: ConfigCurrencies
}
