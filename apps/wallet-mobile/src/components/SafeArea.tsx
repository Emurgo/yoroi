import React from 'react'
import {StyleSheet} from 'react-native'
import {type SafeAreaViewProps, SafeAreaView} from 'react-native-safe-area-context'

import {COLORS} from '../theme'

export const SafeArea = ({children, ...rest}: SafeAreaViewProps) => {
  return (
    <SafeAreaView edges={safeAreaEdges} {...rest} style={[styles.root, rest.style]}>
      {children}
    </SafeAreaView>
  )
}
const safeAreaEdges = ['bottom', 'left', 'right', 'bottom'] as const

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
})
