// @flow

import React from 'react'
import {Image} from 'react-native'
import {createStackNavigator} from '@react-navigation/stack'
// import {createDrawerNavigator} from '@react-navigation/drawer'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'

import {WALLET_ROOT_ROUTES, WALLET_ROUTES} from '../RoutesList'

import NavButton from './TxHistory/NavButton'
import WalletSelectionScreen from './WalletSelection/WalletSelectionScreen'
import TxHistoryNavigator from './TxHistory/TxHistoryNavigator'
import StakingCenterNavigator from './Delegation/StakingCenterNavigator'
import StakingDashboardNavigator from './Delegation/StakingDashboardNavigator'
import SendScreenNavigator from './Send/SendScreenNavigator'
import ReceiveScreenNavigator from './Receive/ReceiveScreenNavigator'

import {COLORS} from '../styles/config'
import iconHistory from '../assets/img/icon/txhistory.png'
import iconHistoryActive from '../assets/img/icon/txhistory-active.png'
import iconSend from '../assets/img/icon/send.png'
import iconSendActive from '../assets/img/icon/send-active.png'
import iconReceive from '../assets/img/icon/receive.png'
import iconReceiveActive from '../assets/img/icon/receive-active.png'
import iconDashboard from '../assets/img/icon/dashboard.png'
import iconDashboardActive from '../assets/img/icon/dashboard-active.png'
import iconDelegate from '../assets/img/icon/delegation.png'
import iconDelegateActive from '../assets/img/icon/delegation-active.png'


const Tab = createBottomTabNavigator()
const WalletTabNavigator = () => (
  <Tab.Navigator
    initialRouteName={WALLET_ROUTES.TX_HISTORY}
    screenOptions={({route}) => ({
      tabBarIcon: ({focused, _color, _size}) => {
        let icon
        if (route.name === WALLET_ROUTES.TX_HISTORY) {
          icon = focused ? iconHistoryActive : iconHistory
        } else if (route.name === WALLET_ROUTES.SEND) {
          icon = focused ? iconSendActive : iconSend
        } else if (route.name === WALLET_ROUTES.RECEIVE) {
          icon = focused ? iconReceiveActive : iconReceive
        // TODO: only for shelley wallets
        } else if (route.name === WALLET_ROUTES.DASHBOARD) {
          icon = focused ? iconDashboardActive : iconDashboard
        } else if (route.name === WALLET_ROUTES.DELEGATE) {
          icon = focused ? iconDelegateActive : iconDelegate
        }

        return (<Image source={icon} />)
      },
    })}
    tabBarOptions={{
      activeTintColor: COLORS.LIGHT_POSITIVE_GREEN,
      inactiveTintColor: COLORS.BLACK, // TODO
    }}
  >
    <Tab.Screen
      name={WALLET_ROUTES.TX_HISTORY}
      component={TxHistoryNavigator}
      options={{headerShown: false}}
    />
    <Tab.Screen name={WALLET_ROUTES.SEND} component={SendScreenNavigator} />
    <Tab.Screen name={WALLET_ROUTES.RECEIVE} component={ReceiveScreenNavigator} />
    <Tab.Screen name={WALLET_ROUTES.DASHBOARD} component={StakingDashboardNavigator} />
    <Tab.Screen name={WALLET_ROUTES.DELEGATE} component={StakingCenterNavigator} />
  </Tab.Navigator>
)

const Stack = createStackNavigator()
const WalletNavigator = () => (
  <Stack.Navigator initialRouteName={WALLET_ROOT_ROUTES.WALLET_SELECTION}>
    <Stack.Screen
      name={WALLET_ROOT_ROUTES.WALLET_SELECTION}
      component={WalletSelectionScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen name={WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES} component={WalletTabNavigator} />
  </Stack.Navigator>
)

export default WalletNavigator
