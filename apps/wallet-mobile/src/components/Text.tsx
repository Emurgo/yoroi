import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Platform, StyleProp, StyleSheet, Text as RNText, TextProps, TextStyle} from 'react-native'

type Props = TextProps & {
  small?: boolean
  secondary?: boolean
  light?: boolean
  bold?: boolean
  monospace?: boolean
  error?: boolean
  adjustsFontSizeToFit?: boolean
}

const androidAdjustsFontSizeToFitFix = (width: number, childrenLength: number) => {
  return Math.floor(1.4 * (width / childrenLength))
}

export const Text = (props: Props) => {
  const [fontSize, setFontSize] = React.useState(0)
  const styles = useStyles()

  const {small, secondary, light, bold, monospace, error, style, children, adjustsFontSizeToFit, ...restProps} = props

  const textStyle: Array<StyleProp<TextStyle>> = [
    styles.text,
    Boolean(small) && styles.small,
    Boolean(secondary) && styles.secondary,
    Boolean(light) && styles.light,
    Boolean(bold) && styles.bold,
    Boolean(monospace) && styles.monospace,
    Boolean(error) && styles.error,
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
          const fixedFontSize = androidAdjustsFontSizeToFitFix(width, children.length)
          const styleFontSize = (style as TextStyle)?.fontSize
          const fontSize = typeof styleFontSize === 'number' ? Math.min(styleFontSize, fixedFontSize) : fixedFontSize

          setFontSize(fontSize)
        }}
        style={textStyle}
      >
        {children}
      </RNText>
    )
  }
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    text: {
      ...atoms.body_2_md_regular,
      color: color.gray_cmax,
    },
    secondary: {
      color: color.gray_c700,
    },
    small: {
      ...atoms.body_3_sm_regular,
    },
    light: {
      color: color.gray_cmin,
    },
    error: {
      color: color.sys_magenta_c500,
    },
    bold: {
      fontFamily: 'Rubik-Medium',
    },
    monospace: {
      ...Platform.select({
        ios: {fontFamily: 'Menlo'},
        android: {fontFamily: 'monospace'},
      }),
    },
  })
  return styles
}
