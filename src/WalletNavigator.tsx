import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image} from 'react-native'
import {useSelector} from 'react-redux'

import CatalystNavigator from '../legacy/components/Catalyst/CatalystNavigator'
import StakingCenterNavigator from '../legacy/components/Delegation/StakingCenterNavigator'
import StakingDashboardNavigator from '../legacy/components/Delegation/StakingDashboardNavigator'
import ReceiveScreenNavigator from '../legacy/components/Receive/ReceiveScreenNavigator'
import SendScreenNavigator from '../legacy/components/Send/SendScreenNavigator'
import TxHistoryNavigator from '../legacy/components/TxHistory/TxHistoryNavigator'
import {isHaskellShelley} from '../legacy/config/config'
import {defaultNavigationOptions} from '../legacy/navigationOptions'
import {isReadOnlySelector} from '../legacy/selectors'
import {theme} from '../legacy/styles/config'
import iconDashboard from './assets/img/icon/dashboard.png'
import iconDashboardActive from './assets/img/icon/dashboard-active.png'
import iconDelegate from './assets/img/icon/delegation.png'
import iconDelegateActive from './assets/img/icon/delegation-active.png'
import iconReceive from './assets/img/icon/receive.png'
import iconReceiveActive from './assets/img/icon/receive-active.png'
import iconSend from './assets/img/icon/send.png'
import iconSendActive from './assets/img/icon/send-active.png'
import iconHistory from './assets/img/icon/txhistory.png'
import iconHistoryActive from './assets/img/icon/txhistory-active.png'
import {useSelectedWallet, WalletSelectionScreen} from './SelectedWallet'
import {SettingsScreenNavigator} from './Settings'

/* eslint-disable @typescript-eslint/no-explicit-any */
type WalletTabRoutes = {
  history: any
  'send-ada': any
  'receive-ada': any
  'staking-dashboard': any
  'staking-center': any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const Tab = createBottomTabNavigator<WalletTabRoutes>()
const WalletTabNavigator = () => {
  const strings = useStrings()
  const isReadOnly = useSelector(isReadOnlySelector)
  const wallet = useSelectedWallet()
  const initialRoute = isHaskellShelley(wallet.walletImplementationId) ? 'staking-dashboard' : 'history'

  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
      backBehavior="initialRoute"
      tabBarOptions={{
        labelStyle: {fontSize: 11},
        activeTintColor: theme.COLORS.NAVIGATION_ACTIVE,
        inactiveTintColor: theme.COLORS.NAVIGATION_INACTIVE,
      }}
    >
      {isHaskellShelley(wallet.walletImplementationId) && (
        <Tab.Screen
          name={'staking-dashboard'}
          component={StakingDashboardNavigator}
          options={{
            tabBarIcon: ({focused}) => <Image source={focused ? iconDashboardActive : iconDashboard} />,
            tabBarLabel: strings.dashboardTabBarLabel,
          }}
        />
      )}

      <Tab.Screen
        name={'history'}
        component={TxHistoryNavigator}
        options={{
          tabBarIcon: ({focused}) => <Image source={focused ? iconHistoryActive : iconHistory} />,
          tabBarLabel: strings.txHistoryTabBarLabel,
        }}
      />

      {!isReadOnly && (
        <Tab.Screen
          name={'send-ada'}
          component={SendScreenNavigator}
          options={{
            tabBarIcon: ({focused}) => <Image source={focused ? iconSendActive : iconSend} />,
            tabBarLabel: strings.sendTabBarLabel,
          }}
        />
      )}

      <Tab.Screen
        name={'receive-ada'}
        component={ReceiveScreenNavigator}
        options={{
          tabBarIcon: ({focused}) => <Image source={focused ? iconReceiveActive : iconReceive} />,
          tabBarLabel: strings.receiveTabBarLabel,
        }}
      />

      {isHaskellShelley(wallet.walletImplementationId) && !isReadOnly && (
        <Tab.Screen
          name={'staking-center'}
          component={StakingCenterNavigator}
          options={{
            tabBarIcon: ({focused}) => <Image source={focused ? iconDelegateActive : iconDelegate} />,
            tabBarLabel: strings.delegateTabBarLabel,
          }}
        />
      )}
    </Tab.Navigator>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type WalletStackRoute = {
  'wallet-selection': any
  'main-wallet-routes': any
  settings: any
  'catalyst-router': any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const Stack = createStackNavigator<WalletStackRoute>()
const WalletNavigator = () => (
  <Stack.Navigator initialRouteName={'wallet-selection'} screenOptions={{headerShown: false}}>
    <Stack.Screen name={'wallet-selection'} component={WalletSelectionScreen} />
    <Stack.Screen name={'main-wallet-routes'} component={WalletTabNavigator} />
    <Stack.Screen name={'settings'} component={SettingsScreenNavigator} />
    <Stack.Screen name={'catalyst-router'} component={CatalystNavigator} options={defaultNavigationOptions} />
  </Stack.Navigator>
)

export default WalletNavigator

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
})

const useStrings = () => {
  const intl = useIntl()

  return {
    dashboardTabBarLabel: intl.formatMessage(messages.dashboardButton),
    txHistoryTabBarLabel: intl.formatMessage(messages.transactionsButton),
    sendTabBarLabel: intl.formatMessage(messages.sendButton),
    receiveTabBarLabel: intl.formatMessage(messages.receiveButton),
    delegateTabBarLabel: intl.formatMessage(messages.delegateButton),
  }
}
