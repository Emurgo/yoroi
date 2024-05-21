import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {ADABalanceCard} from '../../common/ADABalanceCard/ADABalanceCard'

export const PortfolioDashboardScreen = () => {
  const {styles} = useStyles()

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <ADABalanceCard />
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.gray_cmin,
      ...atoms.px_lg,
    },
  })

  return {styles} as const
}
