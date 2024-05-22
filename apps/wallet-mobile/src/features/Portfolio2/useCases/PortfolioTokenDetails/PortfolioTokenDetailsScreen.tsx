import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

export const PortfolioTokenDetailsScreen = () => {
  const {styles} = useStyles()

  return <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}></SafeAreaView>
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
