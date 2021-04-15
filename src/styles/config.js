// @flow

import {Platform} from 'react-native'

export const COLORS = {
  TRANSPARENT: 'transparent',
  BACKGROUND: '#fff',
  BACKGROUND_GRAY: '#f9f9f9',
  BACKGROUND_BLUE: '#254BC9',
  BACKGROUND_LIGHT_GRAY: '#F4F6FC',
  BACKGROUND_RED: '#ff0000',
  BACKGROUND_LIGHT_RED: 'rgba(255, 16, 81, 0.06)',
  BANNER_GREY: '#F0F3F5',
  DARK_GRAY: '#4a4a4a',
  LIGHT_GRAY: '#eee',
  GRAY: '#777',
  WHITE: '#fff',
  BLACK: '#000',
  TRANSPARENT_BLACK: '#00000077',
  LIGHT_POSITIVE_GREEN: '#17d1aa',
  PRIMARY_GRADIENT_START: '#1036a0',
  PRIMARY_GRADIENT_END: '#164ed5',
  POSITIVE_AMOUNT: '#54ca87',
  NEGATIVE_AMOUNT: '#d0021b',
  PRIMARY: '#1036a0',
  PRIMARY_TEXT: '#fff',
  SECONDARY_TEXT: '#ADAEB6',
  DARK_TEXT: '#38393D',
  LIGHT_GRAY_TEXT: '#676970',
  DARK_BLUE: '#1036a0',
  RED: '#ff0000',
  WARNING: '#FFD303',
  WARNING_TEXT_COLOR: '#9E5B0A',
  ERROR_TEXT_COLOR: '#FF1351',
  DISABLED: '#999',
  SHADOW_COLOR: 'rgba(0, 0, 0, 0.06)',
  SHELLEY_BLUE: '#3154CB',
  DIVIDER: '#536ee9',
  TEXT_GRAY: '#353535',
  TEXT_GRAY2: '#9b9b9b',
}

export const DEFAULT_THEME_COLORS = {
  NAVIGATION_ACTIVE: COLORS.LIGHT_POSITIVE_GREEN,
  NAVIGATION_INACTIVE: COLORS.SECONDARY_TEXT,
  BACKGROUND: COLORS.WHITE,
  CODE_STYLE_BACKGROUND: COLORS.LIGHT_GRAY,
}

export const THEME = {
  COLORS: DEFAULT_THEME_COLORS,
  // TEXT: ... // TODO
}

export const DEBUG_BORDERS = {
  borderColor: COLORS.GRAY,
  borderWidth: 1,
}

export const colors = {
  buttonBackground: '#17d1aa',
  buttonBackgroundBlue: '#3154cb',
}

export const spacing = {
  paragraphBottomMargin: 15,
}

const brand = {
  defaultFont: Platform.select({
    ios: 'Rubik-Regular',
    android: 'Rubik-Regular',
  }),
  bold: Platform.select({
    ios: 'Rubik-Medium',
    android: 'Rubik-Medium',
  }),
}

export default brand
