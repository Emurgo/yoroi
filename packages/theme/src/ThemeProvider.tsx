import React from 'react'
import {useColorScheme} from 'react-native'

import {ThemedPalette, SupportedThemes, Theme, ThemeStorage} from './types'
import {defaultLightTheme} from './themes/default-light'
import {defaultDarkTheme} from './themes/default-dark'
import {detectTheme} from './helpers/detect-theme'

const ThemeContext = React.createContext<undefined | ThemeContext>(undefined)
export const ThemeProvider = ({
  children,
  storage,
}: {
  children: React.ReactNode
  storage: ThemeStorage
}) => {
  const colorScheme = useColorScheme()
  const [themeName, setThemeName] = React.useState<
    Exclude<SupportedThemes, 'system'>
  >(detectTheme(colorScheme, storage.read() ?? 'system'))

  const value = React.useMemo(
    () => ({
      name: themes[themeName].name,
      color: themes[themeName].color,

      selectThemeName: (newTheme: SupportedThemes) => {
        const detectedTheme = detectTheme(colorScheme, newTheme)
        setThemeName(detectedTheme)
        storage.save(newTheme)
      },

      isLight: themes[themeName].base === 'light',
      isDark: themes[themeName].base === 'dark',
    }),
    [colorScheme, storage, themeName],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () =>
  React.useContext(ThemeContext) ?? missingProvider()

export const useThemeColor = () => useTheme().color

type ThemeContext = {
  name: SupportedThemes
  color: ThemedPalette
  selectThemeName: (name: SupportedThemes) => void
  isLight: boolean
  isDark: boolean
}

const themes: Record<Exclude<SupportedThemes, 'system'>, Theme> = {
  ['default-light']: defaultLightTheme,
  ['default-dark']: defaultDarkTheme,
}

const missingProvider = () => {
  throw new Error('ThemeProvider is missing')
}
