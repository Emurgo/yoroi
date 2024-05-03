import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'
import {type SafeAreaViewProps, SafeAreaView} from 'react-native-safe-area-context'

export const SafeArea = ({children, ...rest}: SafeAreaViewProps) => {
  const styles = useStyles()
  return (
    <SafeAreaView edges={safeAreaEdges} {...rest} style={[styles.root, rest.style]}>
      {children}
    </SafeAreaView>
  )
}
const safeAreaEdges = ['bottom', 'left', 'right', 'bottom'] as const

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.white_static,
    },
  })
  return styles
}
