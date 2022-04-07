import {Platform} from 'react-native'

// TODO: need to homogenise the code style here. Only use upper case for color
// constants. The rest should follow typical js object naming conventions.
// All reusable styles should be included in the `theme` object

export const COLORS = {
  TRANSPARENT: 'transparent',
  BACKGROUND: '#fff',
  BACKGROUND_GRAY: '#f8f8f8',
  BACKGROUND_BLUE: '#254BC9',
  BACKGROUND_LIGHT_GRAY: '#F4F6FC',
  BACKGROUND_RED: '#ff0000',
  BACKGROUND_LIGHT_RED: 'rgba(255, 16, 81, 0.06)',
  BANNER_GREY: '#F3F5F5',
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
  ALERT_TEXT_COLOR: '#FF1351',
  ERROR_TEXT_COLOR_DARK: '#242838',
  DISABLED: '#999',
  SHADOW_COLOR: 'rgba(0, 0, 0, 0.06)',
  SHELLEY_BLUE: '#3154CB',
  DIVIDER: '#536ee9',
  TEXT_GRAY: '#353535',
  TEXT_GRAY2: '#9b9b9b',
  TEXT_GRAY3: '#A7AFC0',
  TEXT_INPUT: '#6B7384',
  MODAL_HEADING: '#6B7384',
  WORD_BADGE_TEXT: '#6B7384',
  BORDER_GRAY: '#DCE0E9',
  BLUE_LIGHTER: '#164FD6',
  GREY_6: '#A7AFC0',
  ACTION_GRAY: '#8A92A3',
}

// TODO: use lowercase for key names. Eg navigationActive
export const defaultColors = {
  NAVIGATION_ACTIVE: COLORS.LIGHT_POSITIVE_GREEN,
  NAVIGATION_INACTIVE: COLORS.SECONDARY_TEXT,
  BACKGROUND: COLORS.WHITE,
  backgroundAlert: COLORS.BACKGROUND_LIGHT_RED, // follow this style
  CODE_STYLE_BACKGROUND: COLORS.LIGHT_GRAY,
}

export const defaultText = {
  fontFamily: Platform.select({
    ios: 'Rubik-Regular',
    android: 'Rubik-Regular',
  }),
  color: COLORS.BLACK,
  lineHeight: 18,
  fontSize: 14,
}

export const spacing = {
  paragraphBottomMargin: 15,
}

// TODO: use lowercase for key names
export const theme = {
  text: defaultText, // use this style
  COLORS: defaultColors, // not this
  spacing,
}

export const DEBUG_BORDERS = {
  borderColor: COLORS.GRAY,
  borderWidth: 1,
}

// TODO: add these in default theme colors
export const colors = {
  buttonBackground: '#17d1aa',
  buttonBackgroundBlue: '#3154cb',
}

// TODO: remove, use theme instead.
export const brand = {
  defaultFont: Platform.select({
    ios: 'Rubik-Regular',
    android: 'Rubik-Regular',
  }),
  bold: Platform.select({
    ios: 'Rubik-Medium',
    android: 'Rubik-Medium',
  }),
}
