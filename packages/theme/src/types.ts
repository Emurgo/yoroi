import {Atoms} from './atoms/atoms'
import {space} from './tokens/tokens'

export type Theme = {
  base: BaseThemePalette
  name: SupportedThemes
  color: ThemedPalette
  atoms: Atoms
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

  black_static: HexColor
  white_static: HexColor
  green_static: HexColor

  sys_magenta_700: HexColor
  sys_magenta_600: HexColor
  sys_magenta_500: HexColor
  sys_magenta_300: HexColor
  sys_magenta_100: HexColor

  sys_cyan_500: HexColor
  sys_cyan_100: HexColor

  sys_yellow_500: HexColor
  sys_yellow_100: HexColor

  sys_orange_500: HexColor
  sys_orange_100: HexColor

  bg_gradient_1: Gradient
  bg_gradient_2: Gradient
  bg_gradient_3: Gradient
}

export type ThemedPalette = BasePalette & {
  text_primary_max: HexColor
  text_primary_medium: HexColor
  text_primary_min: HexColor
  text_gray_max: HexColor
  text_gray_medium: HexColor
  text_gray_low: HexColor
  text_gray_min: HexColor
  text_error: HexColor
  text_warning: HexColor
  text_success: HexColor
  text_info: HexColor

  bg_color_max: HexColor
  bg_color_min: HexColor

  el_primary_max: HexColor
  el_primary_medium: HexColor
  el_primary_min: HexColor
  el_gray_max: HexColor
  el_gray_medium: HexColor
  el_gray_min: HexColor
  el_secondary: HexColor

  web_overlay: HexColor
  web_bg_sidebar_active: HexColor
  web_bg_sidebar_inactive: HexColor

  mobile_overlay: HexColor
  mobile_bg_blur: HexColor
}

// Base type for padding values
type PaddingValue = (typeof space)[keyof typeof space]

// Specific padding properties
type PaddingProps = {
  padding?: PaddingValue
  paddingTop?: PaddingValue
  paddingBottom?: PaddingValue
  paddingLeft?: PaddingValue
  paddingRight?: PaddingValue
}

export type ThemePadding = {
  p_0: PaddingProps
  p_2xs: PaddingProps
  p_xs: PaddingProps
  p_sm: PaddingProps
  p_md: PaddingProps
  p_lg: PaddingProps
  p_xl: PaddingProps
  p_2xl: PaddingProps

  px_0: PaddingProps
  px_2xs: PaddingProps
  px_xs: PaddingProps
  px_sm: PaddingProps
  px_md: PaddingProps
  px_lg: PaddingProps
  px_xl: PaddingProps
  px_2xl: PaddingProps

  py_0: PaddingProps
  py_2xs: PaddingProps
  py_xs: PaddingProps
  py_sm: PaddingProps
  py_md: PaddingProps
  py_lg: PaddingProps
  py_xl: PaddingProps
  py_2xl: PaddingProps

  pt_0: PaddingProps
  pt_2xs: PaddingProps
  pt_xs: PaddingProps
  pt_sm: PaddingProps
  pt_md: PaddingProps
  pt_lg: PaddingProps
  pt_xl: PaddingProps
  pt_2xl: PaddingProps

  pb_0: PaddingProps
  pb_2xs: PaddingProps
  pb_xs: PaddingProps
  pb_sm: PaddingProps
  pb_md: PaddingProps
  pb_lg: PaddingProps
  pb_xl: PaddingProps
  pb_2xl: PaddingProps

  pl_0: PaddingProps
  pl_2xs: PaddingProps
  pl_xs: PaddingProps
  pl_sm: PaddingProps
  pl_md: PaddingProps
  pl_lg: PaddingProps
  pl_xl: PaddingProps
  pl_2xl: PaddingProps

  pr_0: PaddingProps
  pr_2xs: PaddingProps
  pr_xs: PaddingProps
  pr_sm: PaddingProps
  pr_md: PaddingProps
  pr_lg: PaddingProps
  pr_xl: PaddingProps
  pr_2xl: PaddingProps
}

type TypographyKey =
  | 'heading_1_medium'
  | 'heading_1_regular'
  | 'heading_2_medium'
  | 'heading_2_regular'
  | 'heading_3_medium'
  | 'heading_3_regular'
  | 'heading_4_medium'
  | 'heading_4_regular'
  | 'body_1_lg_medium'
  | 'body_1_lg_regular'
  | 'body_2_md_medium'
  | 'body_2_md_regular'
  | 'body_3_sm_medium'
  | 'body_3_sm_regular'
  | 'button_1_lg'
  | 'button_2_md'
  | 'link_1_lg'
  | 'link_1_lg_underline'
  | 'link_2_md'
  | 'link_2_md_underline'
  | 'navbar'
  | 'font_thin'
  | 'font_normal'
  | 'font_semibold'
  | 'font_bold'
  | 'italic'
  | 'monospace'
  | 'text_left'
  | 'text_center'
  | 'text_right'

// Base type for text styles
type BaseTextStyle = {
  fontSize?: number
  lineHeight?: number
  fontFamily?: string
  letterSpacing?: number
  textTransform?: string
  textDecorationLine?: string
  fontStyle?: string
  textAlign?: string
  fontWeight?: string
}

export type TypographyTheme = {
  [K in TypographyKey]: BaseTextStyle
}

export type SpacingSize =
  | 'none'
  | '_2xs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '_2xl'
