import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

export const ScreenBackground = ({children, style}: ViewProps) => {
  const styles = useStyles()
  return <View style={[styles.container, style]}>{children}</View>
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: color.bg_color_high,
      ...atoms.flex_1,
    },
  })
  return styles
}
