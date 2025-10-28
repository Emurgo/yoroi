import {atoms as a} from '@yoroi/theme'

import {useFocusEffect} from '@react-navigation/native'
import * as React from 'react'
import {ScrollView} from 'react-native'

import {usePageViewTracking} from '~/features/Analytics/hooks/usePageViewTracking'
import {usePortfolio} from '~/features/Portfolio/context/PortfolioProvider'
import {BalanceCard} from '~/ui/BalanceCard/BalanceCard'
import {SafeArea} from '~/ui/SafeArea/SafeArea'

import {DashboardNFTsList} from './DashboardNFTsList/DashboardNFTsList'
import {DashboardTokensList} from './DashboardTokensList/DashboardTokensList'

export const PortfolioDashboardScreen = () => {
  const {resetTabs} = usePortfolio()

  useFocusEffect(
    React.useCallback(() => {
      resetTabs()
    }, [resetTabs]),
  )

  usePageViewTracking('Portfolio Dashboard Page Viewed')

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
