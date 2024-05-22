import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

export const PortfolioDAppsTokenScreen = () => {
  const {styles} = useStyles()

  return <View style={styles.root}></View>
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.pt_lg,
      backgroundColor: color.gray_cmin,
    },
  })

  return {styles} as const
}
