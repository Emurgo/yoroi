import {useTheme} from '@yoroi/theme'
import React, {ReactNode} from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

type Props = {
  children: ReactNode
}

export const SafeArea = ({children}: Props) => {
  const styles = useStyles()
  return (
    <SafeAreaView edges={safeAreaEdges} style={styles.root}>
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
      backgroundColor: color.gray_cmin,
    },
  })
  return styles
}
