import React from 'react'
import {StyleProp, Text as RNText, TextProps, TextStyle} from 'react-native'

import {COLORS, Theme, useTheme} from '../../theme'

type Props = TextProps & {
  light?: boolean
  error?: boolean
  disabled?: boolean
  typography?: keyof Theme['typography']
  gray?: keyof Theme['color']['gray']
}

export const Text: React.FC<Props> = ({gray, light, error, style, disabled, children, ...restProps}) => {
  const {
    theme: {color, typography},
  } = useTheme()

  const defaultStyle = {
    ...typography['body-1-regular'],
    color: color['black-static'],
  }

  const textStyle: Array<StyleProp<TextStyle>> = [
    defaultStyle,
    gray && {color: color.gray[gray]},
    light === true && {color: color['white-static']},
    error === true && {color: color.magenta['500']},
    disabled === true && {color: COLORS.DISABLED}, // TODO: ask the design team what the color of the palette will be
    style,
  ]

  return (
    <RNText {...restProps} style={textStyle}>
      {children}
    </RNText>
  )
}
