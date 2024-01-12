import {ColorValue, TextStyle} from 'react-native'

export type Theme = {
  color: Palette
  typography: Typography
  spacing: Spacing
}

export type Gradient = [ColorValue, ColorValue]

export type Palette = {
  'black-static': ColorValue
  'white-static': ColorValue
  gray: {
    max: ColorValue
    900: ColorValue
    800: ColorValue
    700: ColorValue
    600: ColorValue
    500: ColorValue
    400: ColorValue
    300: ColorValue
    200: ColorValue
    100: ColorValue
    50: ColorValue
    min: ColorValue
  }
  primary: {
    900: ColorValue
    800: ColorValue
    700: ColorValue
    600: ColorValue
    500: ColorValue
    400: ColorValue
    300: ColorValue
    200: ColorValue
    100: ColorValue
  }
  secondary: {
    900: ColorValue
    800: ColorValue
    700: ColorValue
    600: ColorValue
    500: ColorValue
    400: ColorValue
    300: ColorValue
    200: ColorValue
    100: ColorValue
  }
  magenta: {
    700: ColorValue
    600: ColorValue
    500: ColorValue
    300: ColorValue
    100: ColorValue
  }
  cyan: {
    500: ColorValue
    100: ColorValue
  }
  yellow: {
    500: ColorValue
    100: ColorValue
  }
  gradients: {
    'blue-green': Gradient
    green: Gradient
    blue: Gradient
  }
  'overlay-extension': {hex: ColorValue; opacity: number}
  'overlay-mobile': {hex: ColorValue; opacity: number}
  'sidebar-overlay': {hex: ColorValue; opacity: number}
  'sidebar-item': {hex: ColorValue; opacity: number}
}

type TypographyKeys =
  | 'heading-1-medium'
  | 'heading-1-regular'
  | 'heading-2-medium'
  | 'heading-2-regular'
  | 'heading-3-medium'
  | 'heading-3-regular'
  | 'heading-4-medium'
  | 'heading-4-regular'
  | 'heading-5-medium'
  | 'heading-5-regular'
  | 'body-1-medium'
  | 'body-1-regular'
  | 'body-2-medium'
  | 'body-2-regular'
  | 'body-3-medium'
  | 'body-3-regular'
  | 'button-1'
  | 'button-2'
  | 'button-3'
  | 'link-1'
  | 'link-1-underline'
  | 'link-2'
  | 'link-2-underline'
  | 'overline'
  | 'caption-medium'
  | 'caption-regular'

type SpacingKeys =
  | 'spacing-2'
  | 'spacing-4'
  | 'spacing-6'
  | 'spacing-8'
  | 'spacing-10'
  | 'spacing-12'
  | 'spacing-16'
  | 'spacing-24'
  | 'spacing-32'
  | 'spacing-40'
  | 'spacing-48'
  | 'spacing-80'

export type Typography = Record<TypographyKeys, TextStyle>
export type Spacing = Record<SpacingKeys, string>
