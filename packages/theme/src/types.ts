export type Theme = {
  base: BaseThemePalette
  name: SupportedThemes
  color: ThemedPalette
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

// master palette
export type BasePalette = {
  primary_c900: HexColor
  primary_c800: HexColor
  primary_c700: HexColor
  primary_c600: HexColor
  primary_c500: HexColor
  primary_c400: HexColor
  primary_c300: HexColor
  primary_c200: HexColor
  primary_c100: HexColor

  secondary_c900: HexColor
  secondary_c800: HexColor
  secondary_c700: HexColor
  secondary_c600: HexColor
  secondary_c500: HexColor
  secondary_c400: HexColor
  secondary_c300: HexColor
  secondary_c200: HexColor
  secondary_c100: HexColor

  gray_cmax: HexColor
  gray_c900: HexColor
  gray_c800: HexColor
  gray_c700: HexColor
  gray_c600: HexColor
  gray_c500: HexColor
  gray_c400: HexColor
  gray_c300: HexColor
  gray_c200: HexColor
  gray_c100: HexColor
  gray_c50: HexColor
  gray_cmin: HexColor

  black_static: HexColor
  white_static: HexColor

  sys_magenta_c700: HexColor
  sys_magenta_c600: HexColor
  sys_magenta_c500: HexColor
  sys_magenta_c300: HexColor
  sys_magenta_c100: HexColor

  sys_cyan_c500: HexColor
  sys_cyan_c100: HexColor

  sys_yellow_c500: HexColor
  sys_yellow_c100: HexColor

  sys_orange_c500: HexColor
  sys_orange_c100: HexColor

  bg_gradient_1: Gradient
  bg_gradient_2: Gradient
  bg_gradient_3: Gradient
}

export type ThemedPalette = BasePalette & {
  text_primary_high: HexColor
  text_primary_medium: HexColor
  text_primary_low: HexColor
  text_primary_on: HexColor
  text_gray_max: HexColor
  text_gray_normal: HexColor
  text_gray_medium: HexColor
  text_gray_low: HexColor
  text_error: HexColor
  text_warning: HexColor
  text_success: HexColor
  text_info: HexColor

  bg_color_high: HexColor
  bg_color_low: HexColor

  el_primary_high: HexColor
  el_primary_medium: HexColor
  el_primary_low: HexColor
  el_gray_high: HexColor
  el_gray_normal: HexColor
  el_gray_medium: HexColor
  el_gray_low: HexColor
  el_secondary_medium: HexColor
  el_static_white: HexColor

  web_overlay: HexColor
  web_sidebar_item_active: HexColor
  web_sidebar_item_inactive: HexColor

  mobile_overlay: HexColor
  mobile_bg_blur: HexColor
}
