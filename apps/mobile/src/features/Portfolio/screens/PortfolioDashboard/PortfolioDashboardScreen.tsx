import {useFocusEffect} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Space} from '~/ui/Space/Space'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {usePortfolio} from '~/features/Portfolio/context/PortfolioProvider'
import {BalanceCard} from './BalanceCard/BalanceCard'
import {DashboardNFTsList} from './DashboardNFTsList/DashboardNFTsList'
import {DashboardTokensList} from './DashboardTokensList/DashboardTokensList'

export const PortfolioDashboardScreen = () => {
  const {atoms: ta, palette: p} = useTheme()
  const {track} = useMetrics()
  const {resetTabs} = usePortfolio()

  useFocusEffect(
    React.useCallback(() => {
      resetTabs()
      track.portfolioDashboardPageViewed()
    }, [resetTabs, track]),
  )

  return (
    <SafeAreaView
      style={[a.flex_1, {backgroundColor: p.bg_color_max}]}
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
        <BalanceCard />

        <Space.Height.md />

        <DashboardTokensList />

        <Space.Height.md />

        <DashboardNFTsList />
      </ScrollView>
    </SafeAreaView>
  )
}
