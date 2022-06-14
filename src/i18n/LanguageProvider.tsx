import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'
import {IntlProvider} from 'react-intl'
import {Text} from 'react-native'
import {useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions} from 'react-query'

import {setLanguage} from '.'
import {supportedLanguages} from './languages'
import translations from './translations'

const LanguageContext = React.createContext<undefined | LanguageContext>(undefined)
export const LanguageProvider: React.FC = ({children}) => {
  const languageCode = useLanguageCode()
  const selectLanguageCode = useSaveLanguageCode()

  return (
    <LanguageContext.Provider value={{languageCode, selectLanguageCode, supportedLanguages}}>
      <IntlProvider locale={languageCode} messages={translations[languageCode]} textComponent={Text}>
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => React.useContext(LanguageContext) || missingProvider()

const missingProvider = () => {
  throw new Error('LanguageProvider is missing')
}

const useLanguageCode = ({onSuccess, ...options}: UseQueryOptions<string> = {}) => {
  const query = useQuery({
    queryKey: ['languageCode'],
    queryFn: async () => {
      const languageCode = await AsyncStorage.getItem('/appSettings/languageCode')
      if (!languageCode) throw new Error('Missing Language Code')

      return JSON.parse(languageCode)
    },
    onSuccess: (languageCode) => {
      setLanguage(languageCode)
      onSuccess?.(languageCode)
    },
    suspense: true,
    ...options,
  })

  if (!query.data) throw new Error('Invalid state')

  return query.data
}

const useSaveLanguageCode = ({onSuccess, ...options}: UseMutationOptions<void, Error, string> = {}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (languageCode) => AsyncStorage.setItem('/appSettings/languageCode', JSON.stringify(languageCode)),
    onSuccess: (data, variables, context) => {
      setLanguage(variables)
      queryClient.invalidateQueries('languageCode')
      onSuccess?.(data, variables, context)
    },
    ...options,
  })

  return mutation.mutate
}

type LanguageCode = string
type SaveLanguageCode = ReturnType<typeof useSaveLanguageCode>
type SupportedLanguages = typeof supportedLanguages
type LanguageContext = {
  languageCode: LanguageCode
  selectLanguageCode: SaveLanguageCode
  supportedLanguages: SupportedLanguages
}
