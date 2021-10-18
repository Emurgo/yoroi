// @flow

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image} from 'react-native'
import {useSelector} from 'react-redux'

import iconDashboard from '../assets/img/icon/dashboard.png'
import iconDashboardActive from '../assets/img/icon/dashboard-active.png'
import iconDelegate from '../assets/img/icon/delegation.png'
import iconDelegateActive from '../assets/img/icon/delegation-active.png'
import iconReceive from '../assets/img/icon/receive.png'
import iconReceiveActive from '../assets/img/icon/receive-active.png'
import iconSend from '../assets/img/icon/send.png'
import iconSendActive from '../assets/img/icon/send-active.png'
import iconHistory from '../assets/img/icon/txhistory.png'
import iconHistoryActive from '../assets/img/icon/txhistory-active.png'
import {isHaskellShelley} from '../config/config'
import {defaultNavigationOptions} from '../navigationOptions'
import {CATALYST_ROUTES, WALLET_ROOT_ROUTES, WALLET_ROUTES} from '../RoutesList'
import {isReadOnlySelector, walletMetaSelector} from '../selectors'
import {theme} from '../styles/config'
import CatalystNavigator from './Catalyst/CatalystNavigator'
import StakingCenterNavigator from './Delegation/StakingCenterNavigator'
import StakingDashboardNavigator from './Delegation/StakingDashboardNavigator'
import ReceiveScreenNavigator from './Receive/ReceiveScreenNavigator'
import SendScreenNavigator from './Send/SendScreenNavigator'
import SettingsScreenNavigator from './Settings/SettingsScreenNavigator'
import TxHistoryNavigator from './TxHistory/TxHistoryNavigator'
import WalletSelectionScreen from './WalletSelection/WalletSelectionScreen'

type WalletTabRoutes = {
  history: any,
  'send-ada': any,
  'receive-ada': any,
  'staking-dashboard': any,
  'staking-center': any,
}

const Tab = createBottomTabNavigator<any, WalletTabRoutes, any>()
const WalletTabNavigator = () => {
  const strings = useStrings()
  const walletMeta = useSelector(walletMetaSelector)
  const isReadOnly = useSelector(isReadOnlySelector)

  const {walletImplementationId} = walletMeta
  const initialRoute = isHaskellShelley(walletImplementationId) ? WALLET_ROUTES.DASHBOARD : WALLET_ROUTES.TX_HISTORY

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
      {isHaskellShelley(walletImplementationId) && (
        <Tab.Screen
          name={WALLET_ROUTES.DASHBOARD}
          component={StakingDashboardNavigator}
          options={{
            tabBarIcon: ({focused}) => <Image source={focused ? iconDashboardActive : iconDashboard} />,
            tabBarLabel: strings.dashboardTabBarLabel,
          }}
        />
      )}

      <Tab.Screen
        name={WALLET_ROUTES.TX_HISTORY}
        component={TxHistoryNavigator}
        options={{
          tabBarIcon: ({focused}) => <Image source={focused ? iconHistoryActive : iconHistory} />,
          tabBarLabel: strings.txHistoryTabBarLabel,
        }}
      />

      {!isReadOnly && (
        <Tab.Screen
          name={WALLET_ROUTES.SEND}
          component={SendScreenNavigator}
          options={{
            tabBarIcon: ({focused}) => <Image source={focused ? iconSendActive : iconSend} />,
            tabBarLabel: strings.sendTabBarLabel,
          }}
        />
      )}

      <Tab.Screen
        name={WALLET_ROUTES.RECEIVE}
        component={ReceiveScreenNavigator}
        options={{
          tabBarIcon: ({focused}) => <Image source={focused ? iconReceiveActive : iconReceive} />,
          tabBarLabel: strings.receiveTabBarLabel,
        }}
      />

      {isHaskellShelley(walletImplementationId) && !isReadOnly && (
        <Tab.Screen
          name={WALLET_ROUTES.DELEGATE}
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

type WalletStackRoute = {
  'wallet-selection': any,
  'main-wallet-routes': any,
  settings: any,
  'catalyst-router': any,
}

const Stack = createStackNavigator<any, WalletStackRoute, any>()
const WalletNavigator = () => (
  <Stack.Navigator initialRouteName={WALLET_ROOT_ROUTES.WALLET_SELECTION} screenOptions={{headerShown: false}}>
    <Stack.Screen name={WALLET_ROOT_ROUTES.WALLET_SELECTION} component={WalletSelectionScreen} />
    <Stack.Screen name={WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES} component={WalletTabNavigator} />
    <Stack.Screen name={WALLET_ROOT_ROUTES.SETTINGS} component={SettingsScreenNavigator} />
    <Stack.Screen name={CATALYST_ROUTES.ROOT} component={CatalystNavigator} options={defaultNavigationOptions} />
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
