import React from 'react'
import {StyleProp, Text as RNText, TextProps, TextStyle} from 'react-native'

import {COLORS, useTheme} from '../../theme'

type Props = TextProps & {
  small?: boolean
  medium?: boolean
  secondary?: string | boolean
  gray?: string | boolean
  light?: boolean
  bold?: boolean
  error?: boolean
  disabled?: boolean
}

export const Text: React.FC<Props> = ({
  small,
  medium,
  secondary,
  gray,
  light,
  bold,
  error,
  style,
  disabled,
  children,
  ...restProps
}) => {
  const {
    theme: {color, typography},
  } = useTheme()

  const defaultStyle = {
    ...typography['body-1-regular'],
    color: color['black-static'],
  }

  const textStyle: Array<StyleProp<TextStyle>> = [
    defaultStyle,
    medium === true && typography['body-2-regular'],
    small === true && typography['body-3-regular'],
    bold === true && medium !== true && small !== true && typography['body-1-medium'],
    bold === true && medium === true && small !== true && typography['body-2-medium'],
    bold === true && medium !== true && small === true && typography['body-3-medium'],
    secondary === true && {color: color.secondary['400']},
    typeof secondary === 'string' && {color: color.secondary[secondary]},
    gray === true && {color: color.gray['400']},
    typeof gray === 'string' && {color: color.gray[gray]},
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
