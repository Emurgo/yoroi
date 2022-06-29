import React, {useState} from 'react'
import {Platform, StyleProp, Text as RNText, TextProps, TextStyle} from 'react-native'

import {useTheme} from '../theme'

type Props = TextProps & {
  small?: boolean
  secondary?: boolean
  light?: boolean
  bold?: boolean
  error?: boolean
  adjustsFontSizeToFit?: boolean
}

export const foo: StyleProp<TextStyle> = false

const androidAdjustsFontSizeToFitFix = (width, childrenLength) => {
  return Math.floor(1.4 * (width / childrenLength))
}

// eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
export const Text: React.FC<Props> = ({
  small,
  secondary,
  light,
  bold,
  error,
  style,
  children,
  adjustsFontSizeToFit,
  ...restProps
}) => {
  const [fontSize, setFontSize] = useState(0)
  const {theme: {color, typography}} = useTheme()

  const defaultStyle = {
    ...typography['body-1-regular'],
    color: color['black-static'],
  }

  const textStyle: Array<StyleProp<TextStyle>> = [
    defaultStyle,
    small === true && typography['body-3-regular'],
    secondary === true && {color: color.secondary['400']},
    light === true && {color: color['white-static']},
    bold === true && small !== true && typography['body-1-medium'],
    bold === true && small === true && typography['body-3-medium'],
    error === true && {color: color.magenta['500']},
    style,
  ]

  if (fontSize) {
    textStyle.push({fontSize})
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
          const styleFontSize = !!style && 'fontSize' in style && style.fontSize != null && style.fontSize
          const fontSize = styleFontSize ? Math.min(styleFontSize, fixedFontSize) : fixedFontSize

          setFontSize(fontSize)
        }}
        style={textStyle}
      >
        {children}
      </RNText>
    )
  }
}
