import {atoms as a, useTheme} from '@yoroi/theme'

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import * as React from 'react'

import {DiscoverNavigator} from '~/features/Discover/DiscoverNavigator'
import {MenuNavigator} from '~/features/Menu/Menu'
import {PortfolioNavigator} from '~/features/Portfolio/PortfolioNavigator'
import {TxHistoryNavigator} from '~/features/Transactions/TxHistoryNavigator'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'

import {WalletTabRoutes} from './types'

const Tab = createBottomTabNavigator<WalletTabRoutes>()

export const WalletTabNavigator = () => {
  const {palette: p, atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...ta.bg_color_max,
          ...a.border_t,
          borderTopColor: p.gray_200,
        },
        tabBarActiveTintColor: p.primary_600,
        tabBarInactiveTintColor: p.gray_600,
        tabBarLabelStyle: {
          ...a.body_3_sm_medium,
        },
      }}
    >
      <Tab.Screen
        name="history"
        getComponent={() => TxHistoryNavigator}
        options={{
          title: strings.transactions.history.historyTitle,
          tabBarIcon: ({focused, color, size}) =>
            focused ? (
              <Icon.TabWalletActive size={size} color={color} />
            ) : (
              <Icon.TabWallet size={size} color={color} />
            ),
        }}
      />

      <Tab.Screen
        name="portfolio"
        getComponent={() => PortfolioNavigator}
        options={{
          title: strings.portfolio.portfolio,
          tabBarIcon: ({focused, color, size}) =>
            focused ? (
              <Icon.TabPortfolioActive size={size} color={color} />
            ) : (
              <Icon.TabPortfolio size={size} color={color} />
            ),
        }}
      />

      <Tab.Screen
        name="discover"
        getComponent={() => DiscoverNavigator}
        options={{
          title: strings.discover.discoverTitle,
          tabBarIcon: ({focused, color, size}) =>
            focused ? (
              <Icon.TabDiscoverActive size={size} color={color} />
            ) : (
              <Icon.TabDiscover size={size} color={color} />
            ),
        }}
      />

      <Tab.Screen
        name="menu"
        getComponent={() => MenuNavigator}
        options={{
          title: strings.menu.menu,
          tabBarIcon: ({focused, color, size}) =>
            focused ? (
              <Icon.TabMenuActive size={size} color={color} />
            ) : (
              <Icon.TabMenu size={size} color={color} />
            ),
        }}
      />
    </Tab.Navigator>
  )
}
