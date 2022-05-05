export type Theme = Record<string, string>

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
    500: HexColor
    300: HexColor
    100: HexColor
  }
  cyan: {
    400: HexColor
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
  overlay: {hex: HexColor; opacity: number}
}
