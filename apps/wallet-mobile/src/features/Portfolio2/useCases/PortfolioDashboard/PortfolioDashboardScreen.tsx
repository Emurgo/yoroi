import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Spacer} from '../../../../components'
import {ADABalanceCard} from '../../common/ADABalanceCard/ADABalanceCard'
import {DashboardTokensList} from '../../common/DashboardTokensList/DashboardTokensList'

export const PortfolioDashboardScreen = () => {
  const {styles} = useStyles()

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <ScrollView style={styles.root}>
        <ADABalanceCard />

        <Spacer height={16} />

        <DashboardTokensList />
      </ScrollView>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.gray_cmin,
    },
  })

  return {styles} as const
}
