import * as React from 'react'
import {StyleProp, View, ViewStyle} from 'react-native'

type OutlineProps = {
  activeColor: string
  isFocused?: boolean
  color?: string
  style?: StyleProp<ViewStyle>
}

export const Outline = ({
  activeColor,
  isFocused,
  color,
  style,
}: OutlineProps) => {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          borderWidth: isFocused ? 2 : 1,
          borderColor: isFocused ? activeColor : color,
        },
        style,
      ]}
    />
  )
}
