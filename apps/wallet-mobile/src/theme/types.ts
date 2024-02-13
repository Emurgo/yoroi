import {TextStyle} from 'react-native'

export type Theme = {
  color: Palette
  typography: Typography
  spacing: Spacing
}

export type HexColor = `#${string}`

export type Gradient = [HexColor, HexColor]

export type Palette = {
  'black-static': HexColor
  'white-static': HexColor
  gray: {
    max: HexColor
    900: HexColor
    800: HexColor
    700: HexColor
    600: HexColor
    500: HexColor
    400: HexColor
    300: HexColor
    200: HexColor
    100: HexColor
    50: HexColor
    min: HexColor
  }
  primary: {
    900: HexColor
    800: HexColor
    700: HexColor
    600: HexColor
    500: HexColor
    400: HexColor
    300: HexColor
    200: HexColor
    100: HexColor
  }
  secondary: {
    900: HexColor
    800: HexColor
    700: HexColor
    600: HexColor
    500: HexColor
    400: HexColor
    300: HexColor
    200: HexColor
    100: HexColor
  }
  magenta: {
    700: HexColor
    600: HexColor
    500: HexColor
    300: HexColor
    100: HexColor
  }
  cyan: {
    500: HexColor
    100: HexColor
  }
  yellow: {
    500: HexColor
    100: HexColor
  }
  gradients: {
    'blue-green': Gradient
    green: Gradient
    blue: Gradient
  }
  'bottom-sheet-background': HexColor
  'overlay-extension': {hex: HexColor; opacity: number}
  'overlay-mobile': {hex: HexColor; opacity: number}
  'sidebar-overlay': {hex: HexColor; opacity: number}
  'sidebar-item': {hex: HexColor; opacity: number}
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
  | 'body-1-l-medium'
  | 'body-1-l-regular'
  | 'body-2-m-medium'
  | 'body-2-m-regular'
  | 'body-3-s-medium'
  | 'body-3-s-regular'
  | 'button-1-l'
  | 'button-2-m'
  | 'button-3'
  | 'link-1-l'
  | 'link-1-l-underline'
  | 'link-2-m'
  | 'link-2-m-underline'
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
