import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Spacer} from '../../../../components/Spacer/Spacer'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {usePortfolio} from '../../common/PortfolioProvider'
import {BalanceCard} from './BalanceCard/BalanceCard'
import {DashboardNFTsList} from './DashboardNFTsList/DashboardNFTsList'
import {DashboardTokensList} from './DashboardTokensList/DashboardTokensList'

export const PortfolioDashboardScreen = () => {
  const {styles} = useStyles()
  const {track} = useMetrics()
  const {resetTabs} = usePortfolio()

  useFocusEffect(
    React.useCallback(() => {
      resetTabs()
      track.portfolioDashboardPageViewed()
    }, [resetTabs, track]),
  )

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <ScrollView style={styles.root}>
        <BalanceCard />

        <Spacer height={16} />

        <DashboardTokensList />

        <Spacer height={16} />

        <DashboardNFTsList />
      </ScrollView>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
    },
  })

  return {styles} as const
}
