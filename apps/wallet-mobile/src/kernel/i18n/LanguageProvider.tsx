/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {parseSafe, useAsyncStorage} from '@yoroi/common'
import React, {useMemo} from 'react'
import {IntlProvider} from 'react-intl'
import {Text} from 'react-native'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
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

import {numberLocale, systemLocale} from './initialization'
import {LanguageCode, NumberLocale, supportedLanguages} from './languages'
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
  const initialState = React.useMemo(() => {
    return {
      numberLocale,
      languageCode,
      selectLanguageCode,
      supportedLanguages,
      observer,
    }
  }, [languageCode, selectLanguageCode, observer])

  return (
    <LanguageContext.Provider value={initialState}>
      {/* @ts-ignore types/react mistmatch */}
      <IntlProvider
        timeZone={timeZone}
        locale={languageCode}
        messages={translations[languageCode]}
        textComponent={Text as any}
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
  const value = React.useContext(LanguageContext) ?? missingProvider()

  React.useEffect(() => {
    if (onChange) {
      return value.observer.subscribe((result) => {
        onChange(result.data ?? systemLocale)
      })
    }
  }, [onChange, value.observer])
  return value
}

const missingProvider = () => {
  throw new Error('LanguageProvider is missing')
}

const useLanguageCode = ({onSuccess, ...options}: UseQueryOptions<LanguageCode> = {}) => {
  const storage = useAsyncStorage()
  const query = useQuery({
    queryKey: ['languageCode'],
    queryFn: async () => {
      const languageCode = await storage.join('appSettings/').getItem('languageCode', parseLanguageCode)

      return languageCode ?? systemLocale
    },
    onSuccess: (languageCode) => {
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
  const storage = useAsyncStorage()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (languageCode) => storage.join('appSettings/').setItem('languageCode', languageCode),
    onSuccess: (data, languageCode, context) => {
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

const parseLanguageCode = (data: unknown) => {
  const isLanguageCode = (data: unknown): data is LanguageCode =>
    supportedLanguages.some((language) => language.code === data)

  const parsed = parseSafe(data)

  return isLanguageCode(parsed) ? parsed : undefined
}
