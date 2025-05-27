import * as React from 'react'
import {useColorScheme} from 'react-native'
import {freeze} from 'immer'
import {App} from '@yoroi/types'

import {ThemedPalette, ThemeConfig, ThemeName, ThemeBasePalette} from './types'
import {defaultLightTheme} from './themes/default-light'
import {defaultDarkTheme} from './themes/default-dark'
import {detectTheme} from './helpers/detect-theme'

export const ThemeContext = React.createContext<undefined | ThemeContext>(
  undefined,
)
export const ThemeProvider = ({
  children,
  storage,
}: React.PropsWithChildren<{
  storage: App.StorageKeyManager<ThemeName>
}>) => {
  const hostTheme = useColorScheme() ?? 'dark'
  const [selectedThemeName, setSelectedThemeName] = React.useState<ThemeName>(
    storage.read() ?? 'system',
  )
  const [paletteName, setPaletteName] = React.useState<
    Exclude<ThemeName, 'system'>
  >(detectTheme(hostTheme, selectedThemeName))

  const value = React.useMemo(
    () => ({
      name: selectedThemeName,
      paletteName,
      basePalette: themes[paletteName].base,
      palette: themes[paletteName].theme,

      selectTheme: (newThemeName: ThemeName) => {
        setSelectedThemeName(newThemeName)
        setPaletteName(detectTheme(hostTheme, newThemeName))
        storage.save(newThemeName)
      },
      isLight: themes[paletteName].base === 'light',
      isDark: themes[paletteName].base === 'dark',
    }),
    [hostTheme, storage, paletteName, selectedThemeName],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () =>
  React.useContext(ThemeContext) ?? missingProvider()

export const usePalette = () => useTheme().palette

type ThemeContext = {
  name: ThemeName
  paletteName: Exclude<ThemeName, 'system'>
  basePalette: ThemeBasePalette
  palette: ThemedPalette
  selectTheme: (name: ThemeName) => void
  isLight: boolean
  isDark: boolean
}

const themes: Readonly<Record<Exclude<ThemeName, 'system'>, ThemeConfig>> =
  freeze({
    ['default-light']: defaultLightTheme,
    ['default-dark']: defaultDarkTheme,
  })

const missingProvider = () => {
  throw new Error('ThemeProvider is missing')
}
