import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {
  Platform,
  Text as RNText,
  StyleProp,
  TextProps,
  TextStyle,
} from 'react-native'

type Props = TextProps & {
  small?: boolean
  secondary?: boolean
  light?: boolean
  bold?: boolean
  monospace?: boolean
  error?: boolean
  adjustsFontSizeToFit?: boolean
}

const androidAdjustsFontSizeToFitFix = (
  width: number,
  childrenLength: number,
) => {
  return Math.floor(1.4 * (width / childrenLength))
}

export const Text = (props: Props) => {
  const [fontSize, setFontSize] = React.useState(0)
  const {palette: color} = useTheme()

  const {
    small,
    secondary,
    light,
    bold,
    monospace,
    error,
    style,
    children,
    adjustsFontSizeToFit,
    ...restProps
  } = props

  const textStyle: Array<StyleProp<TextStyle>> = [
    a.body_2_md_regular,
    {color: p.gray_max},
    Boolean(small) && a.body_3_sm_regular,
    Boolean(secondary) && {color: p.gray_700},
    Boolean(light) && {color: p.gray_min},
    Boolean(bold) && {fontFamily: 'Rubik-Medium'},
    Boolean(monospace) &&
      Platform.select({
        ios: {fontFamily: 'Menlo'},
        android: {fontFamily: 'monospace'},
      }),
    Boolean(error) && {color: p.sys_magenta_500},
    style,
  ]
  if (fontSize > 0) {
    textStyle.push({fontSize: fontSize})
  }

  if (adjustsFontSizeToFit != null && Platform.OS === 'ios') {
    return (
      <RNText {...restProps} style={textStyle}>
        {children}
      </RNText>
    )
  } else {
    // workaround which fixes adjustsFontSizeToFit at android
    // based on
    // https://github.com/facebook/react-native/issues/20906
    return (
      <RNText
        {...restProps}
        onLayout={(event) => {
          if (adjustsFontSizeToFit == null || typeof children !== 'string') {
            return
          }
          const {width} = event.nativeEvent.layout
          const fixedFontSize = androidAdjustsFontSizeToFitFix(
            width,
            children.length,
          )
          const styleFontSize = (style as TextStyle)?.fontSize
          const fontSize =
            typeof styleFontSize === 'number'
              ? Math.min(styleFontSize, fixedFontSize)
              : fixedFontSize

          setFontSize(fontSize)
        }}
        style={textStyle}
      >
        {children}
      </RNText>
    )
  }
}
