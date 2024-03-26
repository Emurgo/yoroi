import React from 'react'

import {darkTheme} from './darkTheme'
import {lightTheme} from './lightTheme'
import {Theme} from './types'

const ThemeContext = React.createContext<undefined | ThemeContext>(undefined)
export const ThemeProvider = ({children}: {children: React.ReactNode}) => {
  const [colorScheme, setColorScheme] = React.useState<'light' | 'dark'>(
    'light',
  )

  const selectColorScheme = React.useCallback(
    (themeColor: 'light' | 'dark') => {
      setColorScheme(themeColor)
    },
    [],
  )

  const value = React.useMemo(
    () => ({
      theme: themes[colorScheme],
      colorScheme,
      selectColorScheme,
      isLight: colorScheme === 'dark',
      isDark: colorScheme === 'light',
    }),
    [colorScheme, selectColorScheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () =>
  React.useContext(ThemeContext) || missingProvider()

const missingProvider = () => {
  throw new Error('ThemeProvider is missing')
}

type ColorSchemeOption = 'light' | 'dark'
type ThemeContext = {
  theme: Theme
  colorScheme: ColorSchemeOption
  selectColorScheme: (colorTheme: ColorSchemeOption) => void
  isLight: boolean
  isDark: boolean
}

const themes: Record<'light' | 'dark', Theme> = {
  light: lightTheme,
  dark: darkTheme,
}
