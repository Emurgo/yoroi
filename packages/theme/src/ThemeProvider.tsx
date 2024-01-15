import React from 'react'
import {useColorScheme} from 'react-native'

import {darkTheme} from './darkTheme'
import {lightTheme} from './lightTheme'
import {Theme} from './types'

const ThemeContext = React.createContext<undefined | ThemeContext>(undefined)
export const ThemeProvider = ({
  children,
  themeManager,
}: {
  children: React.ReactNode
  themeManager: {isProduction: boolean}
}) => {
  const systemColorScheme = useColorScheme() ?? 'light'
  const {isProduction} = themeManager

  const selectColorScheme = isProduction ? 'light' : 'dark'
  const colorScheme = isProduction ? 'light' : systemColorScheme
  const theme =
    themes[
      isColorScheme(colorScheme)
        ? colorScheme
        : isProduction
        ? 'light'
        : systemColorScheme
    ]
  const isDark = colorScheme === 'dark'
  const isLight = colorScheme === 'light'

  return (
    <ThemeContext.Provider
      value={{theme, colorScheme, selectColorScheme, isLight, isDark}}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () =>
  React.useContext(ThemeContext) || missingProvider()

const missingProvider = () => {
  throw new Error('ThemeProvider is missing')
}

type ColorSchemeOption = 'light' | 'dark' | 'system'
type ThemeContext = {
  theme: Theme
  colorScheme: ColorSchemeOption
  selectColorScheme: ColorSchemeOption
  isLight: boolean
  isDark: boolean
}

const themes: Record<'light' | 'dark', Theme> = {
  light: lightTheme,
  dark: darkTheme,
}

const isColorScheme = (data: unknown): data is 'light' | 'dark' =>
  data === 'light' || data === 'dark'
