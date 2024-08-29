import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, TouchableOpacityProps} from 'react-native'

import {TabsGradient} from '../../../common/TabsGradient/Tabs'
import {portfolioDAppsTabs, TPortfolioDAppsTabs} from '../../../common/types'
import {useStrings} from '../../../common/useStrings'

type DAppTabsProps = {
  activeTab: TPortfolioDAppsTabs
  onChangeTab: (tab: TPortfolioDAppsTabs) => void
}
export const PortfolioDAppTabs = ({activeTab, onChangeTab}: DAppTabsProps) => {
  const strings = useStrings()

  return (
    <TabsGradient>
      <Tab
        onPress={() => {
          onChangeTab(portfolioDAppsTabs.LIQUIDITY_POOL)
        }}
        label={strings.liquidityPool}
        active={activeTab === portfolioDAppsTabs.LIQUIDITY_POOL}
      />

      <Tab
        onPress={() => {
          onChangeTab(portfolioDAppsTabs.OPEN_ORDERS)
        }}
        label={strings.openOrders}
        active={activeTab === portfolioDAppsTabs.OPEN_ORDERS}
      />

      <Tab
        onPress={() => {
          onChangeTab(portfolioDAppsTabs.LEND_BORROW)
        }}
        label={strings.lendAndBorrow}
        active={activeTab === portfolioDAppsTabs.LEND_BORROW}
      />
    </TabsGradient>
  )
}

type TabProps = {
  label: string
  active: boolean
}
const Tab = ({onPress, label, active}: TouchableOpacityProps & TabProps) => {
  const {styles} = useStyles()
  return (
    <TouchableOpacity style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={styles.tabText}>{label}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    tab: {
      ...atoms.p_sm,
      ...atoms.rounded_sm,
    },
    tabActive: {
      color: color.gray_max,
      backgroundColor: color.gray_200,
    },
    tabText: {
      color: color.el_gray_medium,
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
    },
  })

  return {styles} as const
}
