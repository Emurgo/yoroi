import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

export const ScreenBackground = ({children, style}: ViewProps) => {
  const styles = useStyles()
  return <View style={[styles.container, style]}>{children}</View>
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.primary[600],
    },
  })
  return styles
}
