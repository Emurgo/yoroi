import {App} from '@yoroi/types'
import {invalid} from '@yoroi/common'

import * as React from 'react'
import {useColorScheme} from 'react-native'
import {freeze} from 'immer'

import {
  ThemedPalette,
  ThemeRecord,
  ThemeName,
  ThemeBasePalette,
  ThemeConfig,
} from './types'
import {defaultLightTheme} from './themes/default-light'
import {defaultDarkTheme} from './themes/default-dark'
import {detectTheme} from './helpers/detect-theme'

type ThemeContext = {
  config: ThemeConfig
  paletteName: ThemeName
  basePalette: ThemeBasePalette
  basePaletteInverted: ThemeBasePalette
  palette: ThemedPalette
  selectTheme: (name: ThemeConfig) => void
  isLight: boolean
  isDark: boolean
  // NOTE: atoms that are dependent on the theme palette
  atoms: {
    bg_color_max: {backgroundColor: string}
    bg_color_min: {backgroundColor: string}
    el_primary_max: {color: string}
    el_primary_medium: {color: string}
    el_primary_min: {color: string}
    el_gray_max: {color: string}
    el_gray_medium: {color: string}
    el_gray_min: {color: string}
    el_secondary: {color: string}
    input_selected: {color: string}
    text_primary_max: {color: string}
    text_primary_medium: {color: string}
    text_primary_min: {color: string}
    text_gray_max: {color: string}
    text_gray_medium: {color: string}
    text_gray_low: {color: string}
    text_gray_min: {color: string}
    text_error: {color: string}
    text_warning: {color: string}
    text_success: {color: string}
    text_info: {color: string}
    web_bg_sidebar_active: {backgroundColor: string}
    web_bg_sidebar_inactive: {backgroundColor: string}
    mobile_bg_blur: {backgroundColor: string}
  }
}

const themes: Readonly<Record<Exclude<ThemeName, 'system'>, ThemeRecord>> =
  freeze({
    ['default-light']: defaultLightTheme,
    ['default-dark']: defaultDarkTheme,
  })

export const ThemeContext = React.createContext<undefined | ThemeContext>(
  undefined,
)
export const ThemeProvider = ({
  children,
  storage,
}: React.PropsWithChildren<{
  storage: App.StorageKeyManager<ThemeConfig>
}>) => {
  const hostTheme = useColorScheme() ?? 'dark'
  const [selectedThemeConfig, setSelectedThemeConfig] =
    React.useState<ThemeConfig>(() => storage.read())
  const [paletteName, setPaletteName] = React.useState<ThemeName>(
    detectTheme(hostTheme, selectedThemeConfig),
  )

  const value = React.useMemo<ThemeContext>(
    () => ({
      config: selectedThemeConfig,
      paletteName,
      basePalette: themes[paletteName].base,
      palette: themes[paletteName].theme,
      atoms: {
        bg_color_max: {backgroundColor: themes[paletteName].theme.bg_color_max},
        bg_color_min: {backgroundColor: themes[paletteName].theme.bg_color_min},
        el_primary_max: {color: themes[paletteName].theme.el_primary_max},
        el_primary_medium: {color: themes[paletteName].theme.el_primary_medium},
        el_primary_min: {color: themes[paletteName].theme.el_primary_min},
        el_gray_max: {color: themes[paletteName].theme.el_gray_max},
        el_gray_medium: {color: themes[paletteName].theme.el_gray_medium},
        el_gray_min: {color: themes[paletteName].theme.el_gray_min},
        el_secondary: {color: themes[paletteName].theme.el_secondary},
        input_selected: {color: themes[paletteName].theme.input_selected},
        text_primary_max: {color: themes[paletteName].theme.text_primary_max},
        text_primary_medium: {
          color: themes[paletteName].theme.text_primary_medium,
        },
        text_primary_min: {color: themes[paletteName].theme.text_primary_min},
        text_gray_max: {color: themes[paletteName].theme.text_gray_max},
        text_gray_medium: {color: themes[paletteName].theme.text_gray_medium},
        text_gray_low: {color: themes[paletteName].theme.text_gray_low},
        text_gray_min: {color: themes[paletteName].theme.text_gray_min},
        text_error: {color: themes[paletteName].theme.text_error},
        text_warning: {color: themes[paletteName].theme.text_warning},
        text_success: {color: themes[paletteName].theme.text_success},
        text_info: {color: themes[paletteName].theme.text_info},
        web_bg_sidebar_active: {
          backgroundColor: themes[paletteName].theme.web_bg_sidebar_active,
        },
        web_bg_sidebar_inactive: {
          backgroundColor: themes[paletteName].theme.web_bg_sidebar_inactive,
        },
        mobile_bg_blur: {
          backgroundColor: themes[paletteName].theme.mobile_bg_blur,
        },
      },

      selectTheme: (newThemeName: ThemeConfig) => {
        setSelectedThemeConfig(newThemeName)
        setPaletteName(detectTheme(hostTheme, newThemeName))
        storage.save(newThemeName)
      },
      isLight: themes[paletteName].base === 'light',
      isDark: themes[paletteName].base === 'dark',
      basePaletteInverted:
        themes[paletteName].base === 'dark' ? 'light' : 'dark',
    }),
    [hostTheme, storage, paletteName, selectedThemeConfig],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () =>
  React.useContext(ThemeContext) ?? invalid('ThemeProvider is missing')

export const usePalette = () => useTheme().palette
export const useThemedAtoms = () => useTheme().atoms
export const useBasePalette = () => useTheme().basePalette
