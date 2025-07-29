import {useTheme} from '@yoroi/theme'
import React from 'react'
import {View, ViewProps} from 'react-native'

export const Hr = ({style, ...rest}: ViewProps) => {
  const {palette: color} = useTheme()
  return (
    <View
      {...rest}
      style={[{height: 1}, {backgroundColor: p.gray_200}, style]}
    />
  )
}
