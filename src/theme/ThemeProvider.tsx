import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'
import {useColorScheme} from 'react-native'
import {useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions} from 'react-query'

import {darkTheme} from './darkTheme'
import {lightTheme} from './lightTheme'
import {Theme} from './types'

const ThemeContext = React.createContext<undefined | ThemeContext>(undefined)
export const ThemeProvider: React.FC = ({children}) => {
  const savedColorScheme = useSavedColorScheme()
  const osColorScheme = useColorScheme() || 'light'
  const selectColorScheme = useSaveColorScheme()
  const colorScheme = savedColorScheme || osColorScheme || 'light'
  const theme = themes[colorScheme]

  return <ThemeContext.Provider value={{theme, colorScheme, selectColorScheme}}>{children}</ThemeContext.Provider>
}

export const useTheme = () => React.useContext(ThemeContext) || missingProvider()

const missingProvider = () => {
  throw new Error('ThemeProvider is missing')
}

const useSavedColorScheme = (options: UseQueryOptions<ColorScheme | null> = {}) => {
  const query = useQuery({
    queryKey: ['theme'],
    queryFn: async () => {
      const savedTheme = await AsyncStorage.getItem('/appSettings/theme')

      return savedTheme ? JSON.parse(savedTheme) : null
    },
    suspense: true,
    ...options,
  })

  if (!query.isSuccess) throw new Error('Invalid state')

  return query.data
}

const useSaveColorScheme = (options: UseMutationOptions<void, Error, string> = {}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (theme) => AsyncStorage.setItem('/appSettings/theme', JSON.stringify(theme)),
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
