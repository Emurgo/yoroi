import {ColorSchemeName} from 'react-native'
import {SupportedThemes, SpacingSize} from '../types'

export const detectTheme = (
  colorScheme: ColorSchemeName,
  nextTheme: SupportedThemes = 'system',
): Exclude<SupportedThemes, 'system'> => {
  if (nextTheme === 'system') {
    return colorScheme === 'dark' ? 'default-dark' : 'default-light'
  }
  return nextTheme
}

export const baseSpace: Record<SpacingSize, number> = {
  none: 0,
  _2xs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  _2xl: 32,
}
