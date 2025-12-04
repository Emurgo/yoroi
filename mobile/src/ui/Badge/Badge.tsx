import type {Gradient, HexColor} from '@yoroi/theme'
import {atoms as a, useTheme} from '@yoroi/theme'

import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {Text, View, type ViewProps} from 'react-native'

type Props = {
  label: string
  color: Gradient | HexColor
} & ViewProps

export const Badge = ({label, color, style, ...props}: Props) => {
  const {palette: p} = useTheme()

  const isGradient = Array.isArray(color)

  const containerStyle = [
    a.self_start,
    a.flex_row,
    a.align_center,
    {
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      overflow: 'hidden' as const,
    },
    style,
  ]

  const textStyle = [a.body_3_sm_regular, {color: p.white_static}]

  if (isGradient) {
    return (
      <View style={containerStyle} {...props}>
        <LinearGradient
          colors={color}
          start={{x: 0, y: 0.5}}
          end={{x: 1, y: 0.5}}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <Text style={textStyle}>{label}</Text>
      </View>
    )
  }

  return (
    <View style={[...containerStyle, {backgroundColor: color}]} {...props}>
      <Text style={textStyle}>{label}</Text>
    </View>
  )
}
