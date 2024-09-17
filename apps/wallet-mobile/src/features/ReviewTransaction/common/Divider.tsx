import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

export const Divider = () => {
  const {styles} = useStyles()
  return <View style={styles.divider} />
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    divider: {
      height: 1,
      ...atoms.align_stretch,
      backgroundColor: color.gray_200,
    },
  })

  return {styles} as const
}
