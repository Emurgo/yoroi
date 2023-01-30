import React from 'react'
import {useColorScheme} from 'react-native'
import {useMutation, UseMutationOptions, useQuery, useQueryClient} from 'react-query'

import {useStorage} from '../Storage'
import {parseSafe} from '../yoroi-wallets/utils/parsing'
import {darkTheme} from './darkTheme'
import {lightTheme} from './lightTheme'
import {Theme} from './types'

const ThemeContext = React.createContext<undefined | ThemeContext>(undefined)
export const ThemeProvider = ({children}: {children: React.ReactNode}) => {
  const systemColorScheme = useColorScheme()
  const savedColorScheme = useSavedColorScheme()

  const selectColorScheme = useSaveColorScheme()
  const colorScheme = isColorScheme(savedColorScheme) ? savedColorScheme : systemColorScheme ?? 'light'
  const theme = themes[colorScheme]

  return <ThemeContext.Provider value={{theme, colorScheme, selectColorScheme}}>{children}</ThemeContext.Provider>
}

export const useTheme = () => React.useContext(ThemeContext) || missingProvider()

const missingProvider = () => {
  throw new Error('ThemeProvider is missing')
}

const useSavedColorScheme = () => {
  const storage = useStorage()
  const query = useQuery<ColorScheme | undefined>({
    queryKey: ['theme'],
    queryFn: () => storage.join('appSettings/').getItem('theme', parseColorScheme),
    suspense: true,
  })

  return query.data
}

const useSaveColorScheme = (options: UseMutationOptions<void, Error, string> = {}) => {
  const queryClient = useQueryClient()
  const storage = useStorage()
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

const isColorScheme = (data: unknown): data is ColorScheme => data === 'light' || data === 'dark'
const parseColorScheme = (data: unknown) => {
  const parsed = parseSafe(data)

  return isColorScheme(parsed) ? parsed : undefined
}

/* 
syst | L | D | D | L |
disk | X | X | S | S |
resu | L | D | D | L |
*/
