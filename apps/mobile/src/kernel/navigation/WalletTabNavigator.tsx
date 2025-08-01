import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {useTheme} from '@yoroi/theme'
import React from 'react'

import {DiscoverNavigator} from '~/features/Discover/DiscoverNavigator'
import {PortfolioNavigator} from '~/features/Portfolio/PortfolioNavigator'
import {SettingsScreenNavigator} from '~/features/Settings/SettingsScreenNavigator'
import {TxHistoryNavigator} from '~/features/Transactions/TxHistoryNavigator'
import {useStrings} from '~/kernel/i18n/useStrings'
import {WalletTabRoutes} from './navigation'
import {Icon} from '~/ui/Icon'

const Tab = createBottomTabNavigator<WalletTabRoutes>()

export const WalletTabNavigator = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: p.bg_color_max,
          borderTopColor: p.gray_200,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: p.primary_600,
        tabBarInactiveTintColor: p.gray_600,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="history"
        component={TxHistoryNavigator}
        options={{
          title: strings.transactions.history.historyTitle,
          tabBarIcon: ({color, size}) => (
            <Icon.Direction size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="portfolio"
        component={PortfolioNavigator}
        options={{
          title: strings.portfolio.portfolio,
          tabBarIcon: ({color, size}) => (
            <Icon.Portfolio size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="discover"
        component={DiscoverNavigator}
        options={{
          title: strings.discover.discoverTitle,
          tabBarIcon: ({color, size}) => (
            <Icon.DApp size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="menu"
        component={SettingsScreenNavigator}
        options={{
          title: strings.menu.menu,
          tabBarIcon: ({color, size}) => (
            <Icon.Settings size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
} 