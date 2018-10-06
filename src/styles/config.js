// @flow

import {Platform} from 'react-native'

export const COLORS = {
  TRANSPARENT: 'transparent',
  BACKGROUND_GRAY: '#f5fcff',
  DARK_GRAY: '#4a4a4a',
  LIGHT_GRAY: '#eee',
  WHITE: '#fff',
  BLACK: '#000',
  LIGHT_POSITIVE_GREEN: '#17d1aa',
  PRIMARY_GRADIENT_START: '#1036a0',
  PRIMARY_GRADIENT_END: '#164ed5',
  POSITIVE_AMOUNT: '#54ca87',
  NEGATIVE_AMOUNT: '#d0021b',
  PRIMARY: '#0f0',
  PRIMARY_TEXT: '#fff',
}

const brand = {
  defaultFont: Platform.select({
    ios: 'Arial',
    android: 'Roboto',
  }),
}

export default brand
