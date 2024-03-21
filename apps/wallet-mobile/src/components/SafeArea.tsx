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
  const {theme} = useTheme()
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
    },
  })
}
