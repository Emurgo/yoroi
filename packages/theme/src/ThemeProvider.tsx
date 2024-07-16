import React from 'react'
import {ColorSchemeName, useColorScheme as _useColorScheme} from 'react-native'

import {ThemedPalette, SupportedThemes, Theme, ThemeStorage} from './types'
import {defaultLightTheme} from './themes/default-light'
import {defaultDarkTheme} from './themes/default-dark'
import {detectTheme} from './helpers/detect-theme'
import {Atoms} from './atoms/atoms'

type ThemeType = {
  themeName: SupportedThemes
}

const themesData: ThemeType[] = [
  {
    themeName: 'system',
  },
  {
    themeName: 'default-light',
  },
  {
    themeName: 'default-dark',
  },
]

const ThemeContext = React.createContext<undefined | ThemeContext>(undefined)
export const ThemeProvider = ({
  children,
  storage,
}: {
  children: React.ReactNode
  storage: ThemeStorage
}) => {
  const colorScheme = useColorScheme()
  const selectedName = storage.read() ?? 'system'
  const [themeName, setThemeName] = React.useState<
    Exclude<SupportedThemes, 'system'>
  >(detectTheme(colorScheme, selectedName))

  const value = React.useMemo(
    () => ({
      name: selectedName,
      color: themes[themeName].color,

      selectThemeName: (newTheme: SupportedThemes) => {
        const detectedTheme = detectTheme(colorScheme, newTheme)
        setThemeName(detectedTheme)
        storage.save(newTheme)
      },

      isLight: themes[themeName].base === 'light',
      isDark: themes[themeName].base === 'dark',
      atoms: themes[themeName].atoms,
      data: themesData,
    }),
    [colorScheme, storage, themeName, selectedName],
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
  atoms: Atoms
  data: ThemeType[]
}

const themes: Record<Exclude<SupportedThemes, 'system'>, Theme> = {
  ['default-light']: defaultLightTheme,
  ['default-dark']: defaultDarkTheme,
}

const missingProvider = () => {
  throw new Error('ThemeProvider is missing')
}

const useColorScheme = (): NonNullable<ColorSchemeName> => {
  return _useColorScheme() as NonNullable<ColorSchemeName>
}
