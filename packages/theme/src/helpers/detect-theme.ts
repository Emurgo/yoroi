import {ColorSchemeName} from 'react-native'
import {SupportedThemes} from '../types'

export const detectTheme = (
  colorScheme: ColorSchemeName,
  nextTheme: SupportedThemes = 'system',
): Exclude<SupportedThemes, 'system'> => {
  if (nextTheme === 'system') {
    return colorScheme === 'dark' ? 'default-dark' : 'default-light'
  }
  return nextTheme
}
