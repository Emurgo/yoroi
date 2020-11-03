// @flow

import React from 'react'
import {Image} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {createStackNavigator} from '@react-navigation/stack'
// import {createDrawerNavigator} from '@react-navigation/drawer' // TODO(navigation)
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {injectIntl, defineMessages} from 'react-intl'

import {walletMetaSelector} from '../selectors'
import {isHaskellShelley} from '../config/config'
import {WALLET_ROOT_ROUTES, WALLET_ROUTES} from '../RoutesList'
import {Button} from './UiKit'
import WalletSelectionScreen from './WalletSelection/WalletSelectionScreen'
import TxHistoryNavigator from './TxHistory/TxHistoryNavigator'
import StakingCenterNavigator from './Delegation/StakingCenterNavigator'
import StakingDashboardNavigator from './Delegation/StakingDashboardNavigator'
import SendScreenNavigator from './Send/SendScreenNavigator'
import ReceiveScreenNavigator from './Receive/ReceiveScreenNavigator'
import SettingsScreenNavigator from './Settings/SettingsScreenNavigator'
import {defaultNavigationOptions} from '../navigationOptions'


import {DEFAULT_THEME_COLORS} from '../styles/config'
import styles from './TxHistory/styles/SettingsButton.style'
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
import iconGear from '../assets/img/gear.png'

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

const Tab = createBottomTabNavigator()
const WalletTabNavigator = injectIntl(
  compose(
    connect((state) => ({
      walletMeta: walletMetaSelector(state),
    })),
  )(({intl, walletMeta}) => (
    <Tab.Navigator
      initialRouteName={WALLET_ROUTES.TX_HISTORY}
      screenOptions={({navigation, route}) => {
        const attributes = routeTabAttributes[route.name]
        if (attributes == null) throw new Error('unknown wallet route')
        return ({
          tabBarIcon: ({focused, _color, _size}) => {
            const icon = focused ? attributes.activeIcon : attributes.normalIcon
            return (<Image source={icon} />)
          },
          tabBarLabel: intl.formatMessage(attributes.label),
          title: route.params?.title ?? undefined,
          headerRight: () => (
            <Button
              style={styles.settingsButton}
              onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)}
              iconImage={iconGear}
              title=""
              withoutBackground
            />
          ),
          ...defaultNavigationOptions,
        })
      }}
      tabBarOptions={{
        activeTintColor: DEFAULT_THEME_COLORS.NAVIGATION_ACTIVE,
        inactiveTintColor: DEFAULT_THEME_COLORS.NAVIGATION_INACTIVE,
      }}
    >
      <Tab.Screen
        name={WALLET_ROUTES.TX_HISTORY}
        component={TxHistoryNavigator}
        options={{headerShown: false}}
      />
      <Tab.Screen name={WALLET_ROUTES.SEND} component={SendScreenNavigator} />
      <Tab.Screen name={WALLET_ROUTES.RECEIVE} component={ReceiveScreenNavigator} />
      {isHaskellShelley(walletMeta.walletImplementationId) && (
        <>
          <Tab.Screen name={WALLET_ROUTES.DASHBOARD} component={StakingDashboardNavigator} />
          <Tab.Screen name={WALLET_ROUTES.DELEGATE} component={StakingCenterNavigator} />
        </>
      )}
    </Tab.Navigator>
  )),
)

const Stack = createStackNavigator()
const WalletNavigator = () => (
  <Stack.Navigator
    initialRouteName={WALLET_ROOT_ROUTES.WALLET_SELECTION}
    screenOptions={{headerShown: false}}
  >
    <Stack.Screen
      name={WALLET_ROOT_ROUTES.WALLET_SELECTION}
      component={WalletSelectionScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name={WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES}
      component={WalletTabNavigator}
    />
    <Stack.Screen
      name={WALLET_ROOT_ROUTES.SETTINGS}
      component={SettingsScreenNavigator}
      screenOptions={{
        headerShown: false,
        ...defaultNavigationOptions,
      }}
    />
  </Stack.Navigator>
)

export default WalletNavigator
