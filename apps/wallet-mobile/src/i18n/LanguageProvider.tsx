import {parseSafe, useStorage} from '@yoroi/common'
import React, {useMemo} from 'react'
import {IntlProvider} from 'react-intl'
import {NativeModules, Platform, Text} from 'react-native'
import TimeZone from 'react-native-timezone'
import {
  QueryKey,
  QueryObserver,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query'

import {LanguageCode, NumberLocale, numberLocales, supportedLanguages, updateLanguageSettings} from './languages'
import translations from './translations'

const LanguageContext = React.createContext<undefined | LanguageContext>(undefined)
export const LanguageProvider = ({children}: {children: React.ReactNode}) => {
  const languageCode = useLanguageCode()
  const selectLanguageCode = useSaveLanguageCode()
  const timeZone = useTimezone()
  const queryClient = useQueryClient()
  const observer = useMemo(
    () => new QueryObserver<LanguageCode>(queryClient, {queryKey: 'languageCode'}),
    [queryClient],
  )

  return (
    <LanguageContext.Provider
      value={{
        numberLocale: numberLocales[defaultLanguageCode],
        languageCode,
        selectLanguageCode,
        supportedLanguages,
        observer,
      }}
    >
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
  const query = useQuery({
    queryKey: ['timeZone'],
    queryFn: async () => {
      const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const timeZone = await TimeZone.getTimeZone()
      return timeZone ?? defaultTimeZone
    },
    suspense: true,
  })

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!query.data) throw new Error('Invalid state')

  return query.data
}

export const useLanguage = ({onChange}: {onChange?: (languageCode: LanguageCode) => void} = {}) => {
  const value = React.useContext(LanguageContext) || missingProvider()

  React.useEffect(() => {
    if (onChange) {
      return value.observer.subscribe((result) => {
        onChange(result.data ?? defaultLanguageCode)
      })
    }
  }, [onChange, value.observer])
  return value
}

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
      updateLanguageSettings(defaultLanguageCode)
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
      updateLanguageSettings(defaultLanguageCode)
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
  numberLocale: NumberLocale
  languageCode: LanguageCode
  selectLanguageCode: SaveLanguageCode
  supportedLanguages: SupportedLanguages
  observer: QueryObserver<LanguageCode, unknown, LanguageCode, LanguageCode, QueryKey>
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
