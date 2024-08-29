import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

export const Line = () => {
  const {styles} = useStyles()
  return <View style={styles.line} />
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    line: {
      height: 1,
      ...atoms.w_full,
      backgroundColor: color.gray_200,
    },
  })

  return {styles} as const
}
