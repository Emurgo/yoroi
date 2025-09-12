import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View, ViewProps} from 'react-native'

export const Hr = ({style, ...rest}: ViewProps) => {
  const {palette: p} = useTheme()
  return (
    <View
      {...rest}
      style={[
        a.border_b,
        {borderBottomColor: p.el_gray_min, minHeight: 1},
        style,
      ]}
    />
  )
}
