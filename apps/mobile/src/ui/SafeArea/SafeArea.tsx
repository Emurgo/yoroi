import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'
import {
  type SafeAreaViewProps,
  SafeAreaView,
} from 'react-native-safe-area-context'

export const SafeArea = ({children, ...rest}: SafeAreaViewProps) => {
  const {color} = useTheme()
  return (
    <SafeAreaView
      edges={safeAreaEdges}
      {...rest}
      style={[styles.root, {backgroundColor: color.bg_color_max}, rest.style]}
    >
      {children}
    </SafeAreaView>
  )
}
const safeAreaEdges = ['bottom', 'left', 'right', 'bottom'] as const

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
})
