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

const routeTabAttributes = {
  [WALLET_ROUTES.TX_HISTORY]: {
    activeIcon: iconHistoryActive,
    normalIcon: iconHistory,
    label: messages.transactionsButton,
  },
  [WALLET_ROUTES.SEND]: {
    activeIcon: iconSendActive,
    normalIcon: iconSend,
    label: messages.sendButton,
  },
  [WALLET_ROUTES.RECEIVE]: {
    activeIcon: iconReceiveActive,
    normalIcon: iconReceive,
    label: messages.receiveButton,
  },
  [WALLET_ROUTES.DASHBOARD]: {
    activeIcon: iconDashboardActive,
    normalIcon: iconDashboard,
    label: messages.dashboardButton,
  },
  [WALLET_ROUTES.DELEGATE]: {
    activeIcon: iconDelegateActive,
    normalIcon: iconDelegate,
    label: messages.delegateButton,
  },
}

type WalletTabRoutes = {
  history: any,
  'send-ada': any,
  'receive-ada': any,
  'staking-dashboard': any,
  'staking-center': any,
}

const Tab = createBottomTabNavigator<any, WalletTabRoutes, any>()
const WalletTabNavigator = () => {
  const intl = useIntl()
  const walletMeta = useSelector(walletMetaSelector)
  const isReadOnly = useSelector(isReadOnlySelector)

  const {walletImplementationId} = walletMeta
  const initialRoute = isHaskellShelley(walletImplementationId) ? WALLET_ROUTES.DASHBOARD : WALLET_ROUTES.TX_HISTORY

  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
      screenOptions={({route}) => {
        const attributes = routeTabAttributes[route.name]
        if (attributes == null) throw new Error('unknown wallet route')

        return {
          tabBarIcon: ({focused}: {focused: boolean}) => {
            const icon = focused ? attributes.activeIcon : attributes.normalIcon
            return <Image source={icon} />
          },
          tabBarLabel: intl.formatMessage(attributes.label),
        }
      }}
      tabBarOptions={{
        labelStyle: {fontSize: 11},
        activeTintColor: theme.COLORS.NAVIGATION_ACTIVE,
        inactiveTintColor: theme.COLORS.NAVIGATION_INACTIVE,
      }}
      backBehavior="initialRoute"
    >
      {isHaskellShelley(walletImplementationId) && (
        <Tab.Screen name={WALLET_ROUTES.DASHBOARD} component={StakingDashboardNavigator} />
      )}

      <Tab.Screen name={WALLET_ROUTES.TX_HISTORY} component={TxHistoryNavigator} />

      {!isReadOnly && <Tab.Screen name={WALLET_ROUTES.SEND} component={SendScreenNavigator} />}

      <Tab.Screen name={WALLET_ROUTES.RECEIVE} component={ReceiveScreenNavigator} />
      {isHaskellShelley(walletImplementationId) && (
        <>
          {/* VOTING should go here when implemented. */}
          {!isReadOnly && <Tab.Screen name={WALLET_ROUTES.DELEGATE} component={StakingCenterNavigator} />}
        </>
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
    <Stack.Screen
      name={WALLET_ROOT_ROUTES.WALLET_SELECTION}
      component={WalletSelectionScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen name={WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES} component={WalletTabNavigator} />
    <Stack.Screen name={WALLET_ROOT_ROUTES.SETTINGS} component={SettingsScreenNavigator} />
    <Stack.Screen
      name={CATALYST_ROUTES.ROOT}
      component={CatalystNavigator}
      options={{
        headerShown: false,
        ...defaultNavigationOptions,
      }}
    />
  </Stack.Navigator>
)

export default WalletNavigator
