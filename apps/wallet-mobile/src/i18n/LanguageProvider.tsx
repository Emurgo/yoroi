import React, {useMemo} from 'react'
import {IntlProvider} from 'react-intl'
import {NativeModules, Platform, Text} from 'react-native'
import {getTimeZone} from 'react-native-localize'
import {useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions} from 'react-query'

import {useStorage} from '../yoroi-wallets/storage'
import {parseSafe} from '../yoroi-wallets/utils'
import {LanguageCode, supportedLanguages, updateLanguageSettings} from './languages'
import translations from './translations'

const LanguageContext = React.createContext<undefined | LanguageContext>(undefined)
export const LanguageProvider = ({children}: {children: React.ReactNode}) => {
  const languageCode = useLanguageCode()
  const selectLanguageCode = useSaveLanguageCode()
  const timeZone = useTimezone()

  return (
    <LanguageContext.Provider value={{languageCode, selectLanguageCode, supportedLanguages}}>
      <IntlProvider
        timeZone={timeZone}
        locale={languageCode}
        messages={translations[languageCode]}
        textComponent={Text}
      >
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  )
}

const useTimezone = () => {
  return useMemo(() => getTimeZone(), [])
}

export const useLanguage = () => React.useContext(LanguageContext) || missingProvider()

const missingProvider = () => {
  throw new Error('LanguageProvider is missing')
}

const useLanguageCode = ({onSuccess, ...options}: UseQueryOptions<LanguageCode> = {}) => {
  const storage = useStorage()
  const query = useQuery({
    queryKey: ['languageCode'],
    queryFn: async () => {
      const languageCode = await storage.join('appSettings/').getItem('languageCode', parseLanguageCode)

      return languageCode ?? defaultLanguageCode
    },
    onSuccess: (languageCode) => {
      updateLanguageSettings(languageCode)
      onSuccess?.(languageCode)
    },
    suspense: true,
    ...options,
  })

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!query.data) throw new Error('Invalid state')

  return query.data
}

const useSaveLanguageCode = ({onSuccess, ...options}: UseMutationOptions<void, Error, LanguageCode> = {}) => {
  const storage = useStorage()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (languageCode) => storage.join('appSettings/').setItem('languageCode', languageCode),
    onSuccess: (data, languageCode, context) => {
      updateLanguageSettings(languageCode)
      queryClient.invalidateQueries('languageCode')
      onSuccess?.(data, languageCode, context)
    },
    ...options,
  })

  return mutation.mutate
}

type SaveLanguageCode = ReturnType<typeof useSaveLanguageCode>
type SupportedLanguages = typeof supportedLanguages
type LanguageContext = {
  languageCode: LanguageCode
  selectLanguageCode: SaveLanguageCode
  supportedLanguages: SupportedLanguages
}

const systemLanguageCode = Platform.select({
  ios: () =>
    NativeModules.SettingsManager.settings.AppleLocale ?? NativeModules.SettingsManager.settings.AppleLanguages[0],
  android: () => NativeModules.I18nManager.localeIdentifier,
  default: () => 'en-US',
})()

const defaultLanguageCode = supportedLanguages.some((v) => v.code === systemLanguageCode) ? systemLanguageCode : 'en-US'

const parseLanguageCode = (data: unknown) => {
  const isLanguageCode = (data: unknown): data is LanguageCode =>
    supportedLanguages.some((language) => language.code === data)

  const parsed = parseSafe(data)

  return isLanguageCode(parsed) ? parsed : undefined
}
