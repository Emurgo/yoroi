import {atoms as a} from '@yoroi/theme'

import {useFocusEffect} from '@react-navigation/native'
import * as React from 'react'
import {ScrollView} from 'react-native'

import {usePortfolio} from '~/features/Portfolio/context/PortfolioProvider'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {BalanceCard} from '~/ui/BalanceCard/BalanceCard'
import {SafeArea} from '~/ui/SafeArea/SafeArea'

import {DashboardNFTsList} from './DashboardNFTsList/DashboardNFTsList'
import {DashboardTokensList} from './DashboardTokensList/DashboardTokensList'

export const PortfolioDashboardScreen = () => {
  const {track} = useMetrics()
  const {resetTabs} = usePortfolio()

  useFocusEffect(
    React.useCallback(() => {
      resetTabs()
      track.portfolioDashboardPageViewed()
    }, [resetTabs, track]),
  )

  return (
    <SafeArea>
      <ScrollView contentContainerStyle={[a.gap_lg]}>
        <BalanceCard />

        <DashboardTokensList />

        <DashboardNFTsList />
      </ScrollView>
    </SafeArea>
  )
}
