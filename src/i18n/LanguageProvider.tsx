import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'
import {IntlProvider} from 'react-intl'
import {NativeModules, Platform, Text} from 'react-native'
import {useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions} from 'react-query'

import {updateLanguageSettings} from '.'
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
    initialData: systemLanguageCode,
    queryKey: ['languageCode'],
    queryFn: async () => {
      const languageCode = await AsyncStorage.getItem('/appSettings/languageCode')

      return languageCode ? JSON.parse(languageCode) : systemLanguageCode
    },
    onSuccess: (languageCode) => {
      updateLanguageSettings(languageCode)
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
    onSuccess: (data, languageCode, context) => {
      updateLanguageSettings(languageCode)
      queryClient.invalidateQueries('languageCode')
      onSuccess?.(data, languageCode, context)
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

const systemLanguageCode = Platform.select({
  ios: () =>
    NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0],
  android: () => NativeModules.I18nManager.localeIdentifier,
  default: () => 'en-US',
})()
