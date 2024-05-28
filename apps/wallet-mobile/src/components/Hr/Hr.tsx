import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

export const Hr = ({style, ...rest}: ViewProps) => {
  const {styles, colors} = useStyles()
  return <View {...rest} style={[styles.hr, {backgroundColor: colors.bgLine}, style]} />
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    hr: {
      height: StyleSheet.hairlineWidth,
    },
  })
  const colors = {
    bgLine: color.gray_c200,
  }
  return {styles, colors} as const
}
