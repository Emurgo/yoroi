import {Platform} from 'react-native'

import {fontSize, lineHeight, tokens} from '../tokens/tokens'

// to build typography
const fontFamily = {
  regular: {
    fontFamily: 'Rubik',
  },
  medium: {
    fontFamily: 'Rubik-Medium',
  },
  monospace: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      default: 'monospace',
    }),
  },
} as const

const size = {
  h1: {
    fontSize: fontSize._3xl,
    lineHeight: lineHeight._3xl,
  },
  h2: {
    fontSize: fontSize._2xl,
    lineHeight: lineHeight._2xl,
  },
  h3: {
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
  },
  h4: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
  },
  h5: {
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    letterSpacing: 0.6,
  },
  body1: {
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
  body2: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  body3: {
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
  },
  caption: {
    fontSize: fontSize._2xs,
    lineHeight: lineHeight._2xs,
  },
} as const

const typograpghy = {
  heading_1_medium: {
    ...fontFamily.medium,
    ...size.h1,
  },
  heading_1_regular: {
    ...fontFamily.regular,
    ...size.h1,
  },
  heading_2_medium: {
    ...fontFamily.medium,
    ...size.h2,
  },
  heading_2_regular: {
    ...fontFamily.regular,
    ...size.h2,
  },
  heading_3_medium: {
    ...fontFamily.medium,
    ...size.h3,
  },
  heading_3_regular: {
    ...fontFamily.regular,
    ...size.h3,
  },
  heading_4_medium: {
    ...fontFamily.medium,
    ...size.h4,
  },
  heading_4_regular: {
    ...fontFamily.regular,
    ...size.h4,
  },
  body_1_lg_medium: {
    ...fontFamily.medium,
    ...size.body1,
  },
  body_1_lg_regular: {
    ...fontFamily.regular,
    ...size.body1,
  },
  body_2_md_medium: {
    ...fontFamily.medium,
    ...size.body2,
  },
  body_2_md_regular: {
    ...fontFamily.regular,
    ...size.body2,
  },
  body_3_sm_medium: {
    ...fontFamily.medium,
    ...size.body3,
  },
  body_3_sm_regular: {
    ...fontFamily.regular,
    ...size.body3,
  },
  button_1_lg: {
    ...fontFamily.medium,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  button_2_md: {
    ...fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: 20, // no token.
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  link_1_lg: {
    ...fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.sm,
  },
  link_1_lg_underline: {
    ...fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    textDecorationLine: 'underline',
  },
  link_2_md: {
    ...fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: 20, // no token
  },
  link_2_md_underline: {
    ...fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    textDecorationLine: 'underline',
  },
  navbar: {
    ...fontFamily.regular,
    ...size.caption,
    textTransform: 'uppercase',
  },
  font_thin: {
    fontWeight: tokens.fontWeight.thin,
  },
  font_normal: {
    fontWeight: tokens.fontWeight.normal,
  },
  font_semibold: {
    fontWeight: tokens.fontWeight.semibold,
  },
  font_bold: {
    fontWeight: tokens.fontWeight.bold,
  },
  italic: {
    fontStyle: 'italic',
  },
  monospace: {
    ...fontFamily.monospace,
  },
  text_left: {
    textAlign: 'left',
  },
  text_center: {
    textAlign: 'center',
  },
  text_right: {
    textAlign: 'right',
  },
} as const

const padding = {
  p_0: {padding: tokens.space.none},
  p_2xs: {padding: tokens.space._2xs},
  p_xs: {padding: tokens.space.xs},
  p_sm: {padding: tokens.space.sm},
  p_md: {padding: tokens.space.md},
  p_lg: {padding: tokens.space.lg},
  p_xl: {padding: tokens.space.xl},
  p_2xl: {padding: tokens.space._2xl},

  px_0: {paddingLeft: tokens.space.none, paddingRight: tokens.space.none},
  px_2xs: {paddingLeft: tokens.space._2xs, paddingRight: tokens.space._2xs},
  px_xs: {paddingLeft: tokens.space.xs, paddingRight: tokens.space.xs},
  px_sm: {paddingLeft: tokens.space.sm, paddingRight: tokens.space.sm},
  px_md: {paddingLeft: tokens.space.md, paddingRight: tokens.space.md},
  px_lg: {paddingLeft: tokens.space.lg, paddingRight: tokens.space.lg},
  px_xl: {paddingLeft: tokens.space.xl, paddingRight: tokens.space.xl},
  px_2xl: {paddingLeft: tokens.space._2xl, paddingRight: tokens.space._2xl},

  py_0: {paddingTop: tokens.space.none, paddingBottom: tokens.space.none},
  py_2xs: {paddingTop: tokens.space._2xs, paddingBottom: tokens.space._2xs},
  py_xs: {paddingTop: tokens.space.xs, paddingBottom: tokens.space.xs},
  py_sm: {paddingTop: tokens.space.sm, paddingBottom: tokens.space.sm},
  py_md: {paddingTop: tokens.space.md, paddingBottom: tokens.space.md},
  py_lg: {paddingTop: tokens.space.lg, paddingBottom: tokens.space.lg},
  py_xl: {paddingTop: tokens.space.xl, paddingBottom: tokens.space.xl},
  py_2xl: {paddingTop: tokens.space._2xl, paddingBottom: tokens.space._2xl},

  pt_0: {paddingTop: tokens.space.none},
  pt_2xs: {paddingTop: tokens.space._2xs},
  pt_xs: {paddingTop: tokens.space.xs},
  pt_sm: {paddingTop: tokens.space.sm},
  pt_md: {paddingTop: tokens.space.md},
  pt_lg: {paddingTop: tokens.space.lg},
  pt_xl: {paddingTop: tokens.space.xl},
  pt_2xl: {paddingTop: tokens.space._2xl},

  pb_0: {paddingBottom: tokens.space.none},
  pb_2xs: {paddingBottom: tokens.space._2xs},
  pb_xs: {paddingBottom: tokens.space.xs},
  pb_sm: {paddingBottom: tokens.space.sm},
  pb_md: {paddingBottom: tokens.space.md},
  pb_lg: {paddingBottom: tokens.space.lg},
  pb_xl: {paddingBottom: tokens.space.xl},
  pb_2xl: {paddingBottom: tokens.space._2xl},

  pl_0: {paddingLeft: tokens.space.none},
  pl_2xs: {paddingLeft: tokens.space._2xs},
  pl_xs: {paddingLeft: tokens.space.xs},
  pl_sm: {paddingLeft: tokens.space.sm},
  pl_md: {paddingLeft: tokens.space.md},
  pl_lg: {paddingLeft: tokens.space.lg},
  pl_xl: {paddingLeft: tokens.space.xl},
  pl_2xl: {paddingLeft: tokens.space._2xl},

  pr_0: {paddingRight: tokens.space.none},
  pr_2xs: {paddingRight: tokens.space._2xs},
  pr_xs: {paddingRight: tokens.space.xs},
  pr_sm: {paddingRight: tokens.space.sm},
  pr_md: {paddingRight: tokens.space.md},
  pr_lg: {paddingRight: tokens.space.lg},
  pr_xl: {paddingRight: tokens.space.xl},
  pr_2xl: {paddingRight: tokens.space._2xl},
}

export const atoms = {
  ...typograpghy,
  ...padding,

  // positioning
  absolute: {
    position: 'absolute',
  },
  fixed: {
    position: Platform.select({web: 'fixed', native: 'absolute'}) as 'absolute',
  },
  relative: {
    position: 'relative',
  },
  inset_0: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  z_10: {
    zIndex: 10,
  },
  z_20: {
    zIndex: 20,
  },
  z_30: {
    zIndex: 30,
  },
  z_40: {
    zIndex: 40,
  },
  z_50: {
    zIndex: 50,
  },

  overflow_hidden: {
    overflow: 'hidden',
  },

  // border
  border_0: {
    borderWidth: 0,
  },
  border: {
    borderWidth: 1,
  },
  border_t: {
    borderTopWidth: 1,
  },
  border_b: {
    borderBottomWidth: 1,
  },
  border_l: {
    borderLeftWidth: 1,
  },
  border_r: {
    borderRightWidth: 1,
  },

  // shadow
  shadow_sm: {
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 8,
  },
  shadow_md: {
    shadowRadius: 16,
    shadowOpacity: 0.1,
    elevation: 16,
  },
  shadow_lg: {
    shadowRadius: 32,
    shadowOpacity: 0.1,
    elevation: 24,
  },

  // width & height
  w_full: {
    width: '100%',
  },
  h_full: {
    height: '100%',
  },

  // border
  rounded_xs: {
    borderRadius: tokens.borderRadius.xs,
  },
  rounded_sm: {
    borderRadius: tokens.borderRadius.sm,
  },
  rounded_md: {
    borderRadius: tokens.borderRadius.md,
  },
  rounded_full: {
    borderRadius: tokens.borderRadius.full,
  },

  // flex
  gap_2xs: {
    gap: tokens.space._2xs,
  },
  gap_xs: {
    gap: tokens.space.xs,
  },
  gap_sm: {
    gap: tokens.space.sm,
  },
  gap_md: {
    gap: tokens.space.md,
  },
  gap_lg: {
    gap: tokens.space.lg,
  },
  gap_xl: {
    gap: tokens.space.xl,
  },
  gap_2xl: {
    gap: tokens.space._2xl,
  },
  flex: {
    display: 'flex',
  },
  flex_col: {
    flexDirection: 'column',
  },
  flex_row: {
    flexDirection: 'row',
  },
  flex_col_reverse: {
    flexDirection: 'column-reverse',
  },
  flex_row_reverse: {
    flexDirection: 'row-reverse',
  },
  flex_wrap: {
    flexWrap: 'wrap',
  },
  flex_1: {
    flex: 1,
  },
  flex_grow: {
    flexGrow: 1,
  },
  flex_shrink: {
    flexShrink: 1,
  },
  justify_start: {
    justifyContent: 'flex-start',
  },
  justify_center: {
    justifyContent: 'center',
  },
  justify_between: {
    justifyContent: 'space-between',
  },
  justify_end: {
    justifyContent: 'flex-end',
  },
  align_center: {
    alignItems: 'center',
  },
  align_start: {
    alignItems: 'flex-start',
  },
  align_end: {
    alignItems: 'flex-end',
  },
  align_baseline: {
    alignItems: 'baseline',
  },
  align_stretch: {
    alignItems: 'stretch',
  },
  self_auto: {
    alignSelf: 'auto',
  },
  self_start: {
    alignSelf: 'flex-start',
  },
  self_end: {
    alignSelf: 'flex-end',
  },
  self_center: {
    alignSelf: 'center',
  },
  self_stretch: {
    alignSelf: 'stretch',
  },
  self_baseline: {
    alignSelf: 'baseline',
  },
} as const

export type Atoms = typeof atoms
