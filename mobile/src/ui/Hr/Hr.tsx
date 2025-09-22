import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {ColorValue, View} from 'react-native'

type Props = {
  color?: ColorValue
  height?: number
}
export const Hr = ({color, height = 1}: Props) => {
  const {palette: p} = useTheme()
  return (
    <View
      style={[
        a.border_b,
        {
          borderBottomColor: color != null ? color : p.el_gray_min,
          borderBottomWidth: height,
        },
      ]}
    />
  )
}
