import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {CatalystNavigator} from './Catalyst'
import {Icon} from './components'
import {DashboardNavigator} from './Dashboard'
import {isHaskellShelley, UI_V2} from './legacy/config'
import {MenuNavigator} from './Menu'
import {WalletStackRoutes, WalletTabRoutes} from './navigation'
import {ReceiveScreenNavigator} from './Receive'
import {useSelectedWallet, WalletSelectionScreen} from './SelectedWallet'
import {SendScreenNavigator} from './Send'
import {SettingsScreenNavigator} from './Settings'
import {StakingCenterNavigator} from './Staking'
import {theme} from './theme'
import {TxHistoryNavigator} from './TxHistory'

const Tab = createBottomTabNavigator<WalletTabRoutes>()
const WalletTabNavigator = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const initialRoute = isHaskellShelley(wallet.walletImplementationId) ? 'staking-dashboard' : 'history'

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: {fontSize: 11},
        tabBarActiveTintColor: theme.COLORS.NAVIGATION_ACTIVE,
        tabBarInactiveTintColor: theme.COLORS.NAVIGATION_INACTIVE,
      }}
      initialRouteName={initialRoute}
      backBehavior="initialRoute"
    >
      {UI_V2 && (
        <Tab.Screen
          name="history"
          component={TxHistoryNavigator}
          options={{
            tabBarIcon: ({focused}) => (
              <Icon.TabWallet
                size={24}
                color={focused ? theme.COLORS.NAVIGATION_ACTIVE : theme.COLORS.NAVIGATION_INACTIVE}
              />
            ),
            tabBarLabel: strings.walletTabBarLabel,
          }}
        />
      )}

      {isHaskellShelley(wallet.walletImplementationId) && (
        <Tab.Screen
          name="staking-dashboard"
          component={DashboardNavigator}
          options={{
            tabBarIcon: ({focused}) =>
              !UI_V2 ? (
                <Icon.Categories
                  size={30}
                  color={focused ? theme.COLORS.NAVIGATION_ACTIVE : theme.COLORS.NAVIGATION_INACTIVE}
                />
              ) : (
                <Icon.TabStaking
                  size={24}
                  color={focused ? theme.COLORS.NAVIGATION_ACTIVE : theme.COLORS.NAVIGATION_INACTIVE}
                />
              ),
            tabBarLabel: strings.dashboardTabBarLabel,
          }}
        />
      )}

      {!UI_V2 && (
        <Tab.Screen
          name="history"
          component={TxHistoryNavigator}
          options={{
            tabBarIcon: ({focused}) => (
              <Icon.Transaction
                size={38}
                color={focused ? theme.COLORS.NAVIGATION_ACTIVE : theme.COLORS.NAVIGATION_INACTIVE}
              />
            ),
            tabBarLabel: strings.txHistoryTabBarLabel,
          }}
        />
      )}

      {!wallet.isReadOnly && !UI_V2 && (
        <Tab.Screen
          name="send-ada"
          component={SendScreenNavigator}
          options={{
            tabBarIcon: ({focused}) => (
              <Icon.Send
                size={24}
                color={focused ? theme.COLORS.NAVIGATION_ACTIVE : theme.COLORS.NAVIGATION_INACTIVE}
              />
            ),
            tabBarLabel: strings.sendTabBarLabel,
          }}
        />
      )}

      {!UI_V2 && (
        <Tab.Screen
          name="receive-ada"
          component={ReceiveScreenNavigator}
          options={{
            tabBarIcon: ({focused}) => (
              <Icon.Received
                size={24}
                color={focused ? theme.COLORS.NAVIGATION_ACTIVE : theme.COLORS.NAVIGATION_INACTIVE}
              />
            ),
            tabBarLabel: strings.receiveTabBarLabel,
          }}
        />
      )}

      {!UI_V2 && isHaskellShelley(wallet.walletImplementationId) && !wallet.isReadOnly && (
        <Tab.Screen
          name="staking-center"
          component={StakingCenterNavigator}
          options={{
            tabBarIcon: ({focused}) => (
              <Icon.Ada size={18} color={focused ? theme.COLORS.NAVIGATION_ACTIVE : theme.COLORS.NAVIGATION_INACTIVE} />
            ),
            tabBarLabel: strings.delegateTabBarLabel,
          }}
        />
      )}

      {UI_V2 && (
        <Tab.Screen
          name="menu"
          component={MenuNavigator}
          options={{
            tabBarIcon: ({focused}) => (
              <Icon.Menu
                size={20}
                color={focused ? theme.COLORS.NAVIGATION_ACTIVE : theme.COLORS.NAVIGATION_INACTIVE}
              />
            ),
            tabBarLabel: strings.menuTabBarLabel,
          }}
        />
      )}
    </Tab.Navigator>
  )
}

const Stack = createStackNavigator<WalletStackRoutes>()
export const WalletNavigator = () => (
  <Stack.Navigator initialRouteName="wallet-selection" screenOptions={{headerShown: false}}>
    <Stack.Screen name="wallet-selection" component={WalletSelectionScreen} />
    <Stack.Screen name="main-wallet-routes" component={WalletTabNavigator} />
    <Stack.Screen name="settings" component={SettingsScreenNavigator} />
    <Stack.Screen name="catalyst-router" component={CatalystNavigator} />
  </Stack.Navigator>
)

const messages = defineMessages({
  transactionsButton: {
    id: 'components.common.navigation.transactionsButton',
    defaultMessage: '!!!Transactions',
  },
  sendButton: {
    id: 'components.txhistory.txnavigationbuttons.sendButton',
    defaultMessage: '!!!Send',
  },
  receiveButton: {
    id: 'components.txhistory.txnavigationbuttons.receiveButton',
    defaultMessage: '!!!Receive',
  },
  dashboardButton: {
    id: 'components.common.navigation.dashboardButton',
    defaultMessage: '!!!Dashboard',
  },
  delegateButton: {
    id: 'components.common.navigation.delegateButton',
    defaultMessage: '!!!Delegate',
  },
  walletButton: {
    id: 'components.settings.walletsettingscreen.tabTitle',
    defaultMessage: '!!!Wallet',
  },
  stakingButton: {
    id: 'global.staking',
    defaultMessage: '!!!Staking',
  },
  menuButton: {
    id: 'menu',
    defaultMessage: '!!!Menu',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    dashboardTabBarLabel: intl.formatMessage(messages.dashboardButton),
    txHistoryTabBarLabel: intl.formatMessage(messages.transactionsButton),
    sendTabBarLabel: intl.formatMessage(messages.sendButton),
    receiveTabBarLabel: intl.formatMessage(messages.receiveButton),
    delegateTabBarLabel: intl.formatMessage(messages.delegateButton),
    walletTabBarLabel: intl.formatMessage(messages.walletButton),
    menuTabBarLabel: intl.formatMessage(messages.menuButton),
  }
}
