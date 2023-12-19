import React, {ReactNode} from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {COLORS} from '../../../../theme'

type Props = {
  children: ReactNode
}

export const SafeArea = ({children}: Props) => {
  return (
    <SafeAreaView edges={safeAreaEdges} style={styles.root}>
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
