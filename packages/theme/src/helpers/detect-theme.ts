import {ColorSchemeName} from 'react-native'

import {ThemeConfig, ThemeName} from '../types'

export const detectTheme = (
  colorScheme: ColorSchemeName,
  nextTheme: ThemeConfig = 'system',
): ThemeName => {
  if (nextTheme === 'system') {
    return colorScheme === 'dark' ? 'default-dark' : 'default-light'
  }
  return nextTheme
}
