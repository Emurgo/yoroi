import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

export const Hr = ({style, ...rest}: ViewProps) => {
  const {color} = useTheme()
  return (
    <View
      {...rest}
      style={[styles.hr, {backgroundColor: color.gray_200}, style]}
    />
  )
}

const styles = StyleSheet.create({
  hr: {
    height: StyleSheet.hairlineWidth,
  },
})
