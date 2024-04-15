export type Theme = {
  base: BaseThemePalette
  name: SupportedThemes
  color: Palette
}

export type BaseThemePalette = 'light' | 'dark'

export type SupportedThemes = 'default-light' | 'default-dark' | 'system'

export type ThemeStorage = Readonly<{
  save: (name: SupportedThemes) => void
  read: () => SupportedThemes | null
  key: string
}>

export type HexColor = `#${string}`

export type Gradient = HexColor[]

export type Palette = {
  black_static: HexColor
  white_static: HexColor
  gray_max: HexColor
  gray_900: HexColor
  gray_800: HexColor
  gray_700: HexColor
  gray_600: HexColor
  gray_500: HexColor
  gray_400: HexColor
  gray_300: HexColor
  gray_200: HexColor
  gray_100: HexColor
  gray_50: HexColor
  gray_min: HexColor
  primary_900: HexColor
  primary_800: HexColor
  primary_700: HexColor
  primary_600: HexColor
  primary_500: HexColor
  primary_400: HexColor
  primary_300: HexColor
  primary_200: HexColor
  primary_100: HexColor
  secondary_900: HexColor
  secondary_800: HexColor
  secondary_700: HexColor
  secondary_600: HexColor
  secondary_500: HexColor
  secondary_400: HexColor
  secondary_300: HexColor
  secondary_200: HexColor
  secondary_100: HexColor
  magenta_700: HexColor
  magenta_600: HexColor
  magenta_500: HexColor
  magenta_300: HexColor
  magenta_100: HexColor
  cyan_500: HexColor
  cyan_100: HexColor
  yellow_500: HexColor
  yellow_100: HexColor
  gradients_blue_green: Gradient
  gradients_green: Gradient
  gradients_blue: Gradient
  gradients_light: Gradient
  gradients_green_blue: Gradient
  bottom_sheet_background: HexColor
  bottom_sheet_opacity: string
  overlay_extension: {hex: HexColor; opacity: number}
  overlay_mobile: {hex: HexColor; opacity: number}
  sidebar_overlay: {hex: HexColor; opacity: number}
  sidebar_item: {hex: HexColor; opacity: number}
}
