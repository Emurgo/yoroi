import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, TouchableOpacityProps} from 'react-native'

import {useStrings} from '../../../common/hooks/useStrings'
import {PortfolioDappsTab, usePortfolio} from '../../../common/PortfolioProvider'
import {TabsGradient} from '../../../common/TabsGradient/Tabs'

export const PortfolioDAppTabs = () => {
  const strings = useStrings()
  const {dappsTab, setDappsTab} = usePortfolio()

  return (
    <TabsGradient>
      <Tab
        onPress={() => {
          setDappsTab(PortfolioDappsTab.LiquidityPool)
        }}
        label={strings.liquidityPool}
        active={dappsTab === PortfolioDappsTab.LiquidityPool}
      />

      <Tab
        onPress={() => {
          setDappsTab(PortfolioDappsTab.OpenOrders)
        }}
        label={strings.openOrders}
        active={dappsTab === PortfolioDappsTab.OpenOrders}
      />

      <Tab
        onPress={() => {
          setDappsTab(PortfolioDappsTab.LendAndBorrow)
        }}
        label={strings.lendAndBorrow}
        active={dappsTab === PortfolioDappsTab.LendAndBorrow}
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
