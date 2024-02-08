import {TextStyle} from 'react-native'

import {Typography} from './types'

const fontFamily: Record<string, TextStyle> = {
  regular: {
    fontFamily: 'Rubik',
  },
  medium: {
    fontFamily: 'Rubik-Medium',
  },
}

// const fontScale: Record<string, TextStyle> = {
//   small: {
//     fontWeight: '300',
//   },
//   normall: {
//     fontWeight: '400',
//   },
//   big: {
//     fontWeight: '500',
//   },
//   large: {
//     fontWeight: '600',
//   },
// }

const size: Record<string, TextStyle> = {
  h1: {
    fontSize: 28,
    lineHeight: 36,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    lineHeight: 30,
  },
  h4: {
    fontSize: 18,
    lineHeight: 26,
  },
  h5: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
  },
  body1: {
    fontSize: 16,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    lineHeight: 22,
  },
  body3: {
    fontSize: 12,
    lineHeight: 18,
  },
  // large: {
  //   fontSize: 16,
  //   lineHeight: 24,
  // },
  // normal: {
  //   fontSize: 14,
  //   lineHeight: 22,
  // },
  // small: {
  //   fontSize: 12,
  //   lineHeight: 18,
  // },
  caption: {
    fontSize: 10,
    lineHeight: 18,
  },
}

export const typography: Typography = {
  'heading-1-medium': {
    ...fontFamily.medium,
    ...size.h1,
  },
  'heading-1-regular': {
    ...fontFamily.regular,
    ...size.h1,
  },
  'heading-2-medium': {
    ...fontFamily.medium,
    ...size.h2,
  },
  'heading-2-regular': {
    ...fontFamily.regular,
    ...size.h2,
  },
  'heading-3-medium': {
    ...fontFamily.medium,
    ...size.h3,
  },
  'heading-3-regular': {
    ...fontFamily.regular,
    ...size.h3,
  },
  'heading-4-medium': {
    ...fontFamily.medium,
    ...size.h4,
  },
  'heading-4-regular': {
    ...fontFamily.regular,
    ...size.h4,
  },
  'heading-5-medium': {
    ...fontFamily.medium,
    ...size.h5,
    textTransform: 'uppercase',
  },
  'heading-5-regular': {
    ...fontFamily.regular,
    ...size.h5,
    textTransform: 'uppercase',
  },
  'body-1-medium': {
    ...fontFamily.medium,
    ...size.body1,
  },
  'body-1-regular': {
    ...fontFamily.regular,
    ...size.body1,
  },
  'body-2-medium': {
    ...fontFamily.medium,
    ...size.body2,
  },
  'body-2-regular': {
    ...fontFamily.regular,
    ...size.body2,
  },
  'body-3-medium': {
    ...fontFamily.medium,
    ...size.body3,
  },
  'body-3-regular': {
    ...fontFamily.regular,
    ...size.body3,
  },
  'button-1': {
    ...fontFamily.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  'button-2': {
    ...fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  'button-3': {
    ...fontFamily.medium,
    fontSize: 12,
    lineHeight: 19,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  'link-1': {
    ...fontFamily.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  'link-1-underline': {
    ...fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    textDecorationLine: 'underline',
  },
  'link-2': {
    ...fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  'link-2-underline': {
    ...fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    textDecorationLine: 'underline',
  },
  'overline': {
    ...fontFamily.regular,
    fontSize: 10,
    lineHeight: 18,
    textTransform: 'uppercase',
  },
  'caption-medium': {
    ...fontFamily.medium,
    ...size.caption,
  },
  'caption-regular': {
    ...fontFamily.regular,
    ...size.caption,
  },
}
