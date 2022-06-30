import React from 'react'
import {StyleProp, Text as RNText, TextProps, TextStyle} from 'react-native'

import {useTheme} from '../theme'

type Props = TextProps & {
  small?: boolean
  secondary?: boolean
  light?: boolean
  bold?: boolean
  error?: boolean
}

// eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
export const Text: React.FC<Props> = ({small, secondary, light, bold, error, style, children, ...restProps}) => {
  const {
    theme: {color, typography},
  } = useTheme()

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

  return (
    <RNText {...restProps} style={textStyle}>
      {children}
    </RNText>
  )
}
