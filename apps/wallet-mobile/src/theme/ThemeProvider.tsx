import {parseSafe, useStorage} from '@yoroi/common'
import React from 'react'
import {useColorScheme} from 'react-native'
import {useMutation, UseMutationOptions, useQuery, useQueryClient} from 'react-query'

import {darkTheme} from './darkTheme'
import {lightTheme} from './lightTheme'
import {Theme} from './types'

const ThemeContext = React.createContext<undefined | ThemeContext>(undefined)
export const ThemeProvider = ({children}: {children: React.ReactNode}) => {
  const systemColorScheme = useColorScheme() ?? 'light'
  const savedColorScheme = useSavedColorScheme()

  const selectColorScheme = useSaveColorScheme()
  const colorScheme = savedColorScheme ?? systemColorScheme
  const theme = themes[isColorScheme(colorScheme) ? colorScheme : systemColorScheme]

  return <ThemeContext.Provider value={{theme, colorScheme, selectColorScheme}}>{children}</ThemeContext.Provider>
}

export const useTheme = () => React.useContext(ThemeContext) || missingProvider()

const missingProvider = () => {
  throw new Error('ThemeProvider is missing')
}

const useSavedColorScheme = () => {
  const storage = useStorage()
  const query = useQuery<ColorSchemeOption | undefined>({
    queryKey: ['colorScheme'],
    queryFn: () => storage.join('appSettings/').getItem('colorScheme', parseColorScheme),
    suspense: true,
  })

  return query.data
}

const useSaveColorScheme = (options: UseMutationOptions<void, Error, ColorSchemeOption> = {}) => {
  const queryClient = useQueryClient()
  const storage = useStorage()
  const mutation = useMutation({
    mutationFn: async (colorScheme) => storage.join('appSettings/').setItem('colorScheme', colorScheme),
    onSuccess: () => queryClient.invalidateQueries('colorScheme'),
    ...options,
  })

  return mutation.mutate
}

type SelectColorScheme = ReturnType<typeof useSaveColorScheme>
type ColorSchemeOption = 'light' | 'dark' | 'system'
type ThemeContext = {
  theme: Theme
  colorScheme: ColorSchemeOption
  selectColorScheme: SelectColorScheme
}

const themes: Record<'light' | 'dark', Theme> = {
  light: lightTheme,
  dark: darkTheme,
}

const isColorScheme = (data: unknown): data is 'light' | 'dark' => data === 'light' || data === 'dark'
const parseColorScheme = (data: unknown) => {
  const parsed = parseSafe(data)

  return isColorScheme(parsed) ? parsed : undefined
}
