import {TextStyle} from 'react-native'

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

export const heading1Medium: TextStyle = {
  ...weight.medium,
  ...size.h1,
}

export const heading1Regular: TextStyle = {
  ...weight.regular,
  ...size.h1,
}

export const heading2Medium: TextStyle = {
  ...weight.medium,
  ...size.h2,
}

export const heading2Regular: TextStyle = {
  ...weight.regular,
  ...size.h2,
}

export const heading3Medium: TextStyle = {
  ...weight.medium,
  ...size.h3,
}

export const heading3Regular: TextStyle = {
  ...weight.regular,
  ...size.h3,
}

export const heading4Medium: TextStyle = {
  ...weight.medium,
  ...size.h4,
}

export const heading4Regular: TextStyle = {
  ...weight.regular,
  ...size.h4,
}

export const heading5Medium: TextStyle = {
  ...weight.medium,
  ...size.h5,
  textTransform: 'uppercase',
}

export const heading5Regular: TextStyle = {
  ...weight.regular,
  ...size.h5,
  textTransform: 'uppercase',
}

export const body1Medium: TextStyle = {
  ...weight.medium,
  ...size.body1,
}

export const body1Regular: TextStyle = {
  ...weight.regular,
  ...size.body1,
}

export const body2Medium: TextStyle = {
  ...weight.medium,
  ...size.body2,
}

export const body2Regular: TextStyle = {
  ...weight.regular,
  ...size.body2,
}

export const body3Medium: TextStyle = {
  ...weight.medium,
  ...size.body3,
}

export const body3Regular: TextStyle = {
  ...weight.regular,
  ...size.body3,
}
export const button1: TextStyle = {
  ...weight.medium,
  fontSize: 16,
  lineHeight: 24,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
}

export const button2: TextStyle = {
  ...weight.medium,
  fontSize: 14,
  lineHeight: 20,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
}

export const button3: TextStyle = {
  ...weight.medium,
  fontSize: 12,
  lineHeight: 19,
  letterSpacing: 0.3,
  textTransform: 'uppercase',
}

export const link1: TextStyle = {
  ...weight.regular,
  fontSize: 16,
  lineHeight: 22,
}

export const link1Underline: TextStyle = {
  ...weight.regular,
  fontSize: 16,
  lineHeight: 24,
  textDecorationLine: 'underline',
}

export const link2: TextStyle = {
  ...weight.regular,
  fontSize: 14,
  lineHeight: 20,
}

export const link2Underline: TextStyle = {
  ...weight.regular,
  fontSize: 14,
  lineHeight: 22,
  textDecorationLine: 'underline',
}

export const overline: TextStyle = {
  ...weight.regular,
  fontSize: 10,
  lineHeight: 18,
  textTransform: 'uppercase',
}

export const captionMedium: TextStyle = {
  ...weight.medium,
  ...size.caption,
}

export const captionRegular: TextStyle = {
  ...weight.regular,
  ...size.caption,
}

export const typography = {
  'heading-1-medium': heading1Medium,
  'heading-1-regular': heading1Regular,
  'heading-2-medium': heading2Medium,
  'heading-2-regular': heading2Regular,
  'heading-3-medium': heading3Medium,
  'heading-3-regular': heading3Regular,
  'heading-4-medium': heading4Medium,
  'heading-4-regular': heading4Regular,
  'heading-5-medium': heading5Medium,
  'heading-5-regular': heading5Regular,
  'body-1-medium': body1Medium,
  'body-1-regular': body1Regular,
  'body-2-medium': body2Medium,
  'body-2-regular': body2Regular,
  'body-3-medium': body3Medium,
  'body-3-regular': body3Regular,
  'button-1': button1,
  'button-2': button2,
  'button-3': button3,
  'link-1': link1,
  'link-1-underline': link1Underline,
  'link-2': link2,
  'link-2-underline': link2Underline,
  overline,
  'caption-medium': captionMedium,
  'caption-regular': captionRegular,
}

export type Typography = typeof typography
