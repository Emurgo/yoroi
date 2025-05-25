import {ColorSchemeName} from 'react-native'

import {ThemeName} from '../types'

export const detectTheme = (
  colorScheme: ColorSchemeName,
  nextTheme: ThemeName = 'system',
): Exclude<ThemeName, 'system'> => {
  if (nextTheme === 'system') {
    return colorScheme === 'dark' ? 'default-dark' : 'default-light'
  }
  return nextTheme
}
