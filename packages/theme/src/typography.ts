import {TextStyle} from 'react-native'

import {Typography} from './types'

const weight: Record<string, TextStyle> = {
  regular: {
    fontFamily: 'Rubik',
  },
  medium: {
    fontFamily: 'Rubik-Medium',
  },
}

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
  caption: {
    fontSize: 10,
    lineHeight: 18,
  },
}

export const typography: Typography = {
  'heading-1-medium': {
    ...weight.medium,
    ...size.h1,
  },
  'heading-1-regular': {
    ...weight.regular,
    ...size.h1,
  },
  'heading-2-medium': {
    ...weight.medium,
    ...size.h2,
  },
  'heading-2-regular': {
    ...weight.regular,
    ...size.h2,
  },
  'heading-3-medium': {
    ...weight.medium,
    ...size.h3,
  },
  'heading-3-regular': {
    ...weight.regular,
    ...size.h3,
  },
  'heading-4-medium': {
    ...weight.medium,
    ...size.h4,
  },
  'heading-4-regular': {
    ...weight.regular,
    ...size.h4,
  },
  'heading-5-medium': {
    ...weight.medium,
    ...size.h5,
    textTransform: 'uppercase',
  },
  'heading-5-regular': {
    ...weight.regular,
    ...size.h5,
    textTransform: 'uppercase',
  },
  'body-1-medium': {
    ...weight.medium,
    ...size.body1,
  },
  'body-1-regular': {
    ...weight.regular,
    ...size.body1,
  },
  'body-2-medium': {
    ...weight.medium,
    ...size.body2,
  },
  'body-2-regular': {
    ...weight.regular,
    ...size.body2,
  },
  'body-3-medium': {
    ...weight.medium,
    ...size.body3,
  },
  'body-3-regular': {
    ...weight.regular,
    ...size.body3,
  },
  'button-1': {
    ...weight.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  'button-2': {
    ...weight.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  'button-3': {
    ...weight.medium,
    fontSize: 12,
    lineHeight: 19,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  'link-1': {
    ...weight.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  'link-1-underline': {
    ...weight.regular,
    fontSize: 16,
    lineHeight: 24,
    textDecorationLine: 'underline',
  },
  'link-2': {
    ...weight.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  'link-2-underline': {
    ...weight.regular,
    fontSize: 14,
    lineHeight: 22,
    textDecorationLine: 'underline',
  },
  'overline': {
    ...weight.regular,
    fontSize: 10,
    lineHeight: 18,
    textTransform: 'uppercase',
  },
  'caption-medium': {
    ...weight.medium,
    ...size.caption,
  },
  'caption-regular': {
    ...weight.regular,
    ...size.caption,
  },
}
