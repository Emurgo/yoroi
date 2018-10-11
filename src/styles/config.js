// @flow

import {Platform} from 'react-native'

export const COLORS = {
  TRANSPARENT: 'transparent',
  BACKGROUND_GRAY: '#f5fcff',
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
  DARK_BLUE: '#1036a0',
}

export const DEBUG_BORDERS = {
  borderColor: COLORS.GRAY,
  borderWidth: 1,
}


const brand = {
  defaultFont: Platform.select({
    ios: 'Arial',
    android: 'Roboto',
  }),
}

export default brand
