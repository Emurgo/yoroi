import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

export const ScreenBackground = ({children, style}: ViewProps) => {
  const styles = useStyles()
  return <View style={[styles.container, style]}>{children}</View>
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.primary_c600,
    },
  })
  return styles
}
