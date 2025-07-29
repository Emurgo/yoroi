import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, TouchableOpacity, TouchableOpacityProps} from 'react-native'

import {useStrings} from '~/features/ReviewTx/common/hooks/useStrings'
import {
  PortfolioDappsTab,
  usePortfolio,
} from '~/features/Portfolio/context/PortfolioProvider'
import {TabsGradient} from '~/ui/TabsGradient/Tabs'

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
  const {atoms: ta, palette: p} = useTheme()
  return (
    <TouchableOpacity
      style={[a.p_sm, a.rounded_sm, active && {backgroundColor: p.gray_200}]}
      onPress={onPress}
    >
      <Text
        style={[
          {color: active ? p.gray_max : p.el_gray_medium},
          a.body_1_lg_medium,
          a.font_semibold,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}
