import React from 'react'
import {useColorScheme} from 'react-native'
import {useMutation, UseMutationOptions, useQuery, useQueryClient} from 'react-query'

import {isEmptyString} from '../legacy/utils'
import {storage} from '../yoroi-wallets/storage'
import {parseString} from '../yoroi-wallets/utils/parsing'
import {darkTheme} from './darkTheme'
import {lightTheme} from './lightTheme'
import {Theme} from './types'

const ThemeContext = React.createContext<undefined | ThemeContext>(undefined)
export const ThemeProvider = ({children}: {children: React.ReactNode}) => {
  const defaultColorScheme = useColorScheme() ?? 'light'
  const savedColorScheme = useSavedColorScheme()

  const selectColorScheme = useSaveColorScheme()
  const colorScheme = savedColorScheme ?? defaultColorScheme
  const theme = themes[colorScheme]

  return <ThemeContext.Provider value={{theme, colorScheme, selectColorScheme}}>{children}</ThemeContext.Provider>
}

export const useTheme = () => React.useContext(ThemeContext) || missingProvider()

const missingProvider = () => {
  throw new Error('ThemeProvider is missing')
}

const useSavedColorScheme = () => {
  const query = useQuery<ColorScheme | null>({
    queryKey: ['theme'],
    queryFn: async () => {
      const savedTheme = await storage.join('appSettings/').getItem('theme', parseString)

      return !isEmptyString(savedTheme) ? JSON.parse(savedTheme) : null
    },
    suspense: true,
  })

  return query.data
}

const useSaveColorScheme = (options: UseMutationOptions<void, Error, string> = {}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (theme) => storage.join('appSettings/').setItem('theme', theme),
    onSuccess: () => queryClient.invalidateQueries('theme'),
    ...options,
  })

  return mutation.mutate
}

type SelectColorScheme = ReturnType<typeof useSaveColorScheme>
type ThemeContext = {
  theme: Theme
  colorScheme: ColorScheme
  selectColorScheme: SelectColorScheme
}

type ColorScheme = 'light' | 'dark'
const themes: Record<ColorScheme, Theme> = {
  light: lightTheme,
  dark: darkTheme,
}
