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
      flex: 1,
      backgroundColor: color.gray_cmin,
      ...atoms.pt_lg,
    },
  })

  return {styles} as const
}
