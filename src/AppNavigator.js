// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
// import {createStackNavigator, createSwitchNavigator} from 'react-navigation'
import {NavigationContainer} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {createDrawerNavigator} from '@react-navigation/drawer'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'

import {CONFIG} from './config/config'
import {
  isAppInitializedSelector,
  isMaintenanceSelector,
  languageSelector,
  tosSelector,
  isSystemAuthEnabledSelector,
  isAuthenticatedSelector,
  customPinHashSelector,
} from './selectors'
import HeaderBackButton from './components/UiKit/HeaderBackButton'
import WalletInitNavigator from './components/WalletInit/WalletInitNavigator'
// eslint-disable-next-line max-len
import WalletSelectionScreen from './components/WalletSelection/WalletSelectionScreen'
import TxHistoryNavigator from './components/TxHistory/TxHistoryNavigator'
import StakingCenterNavigator from './components/Delegation/StakingCenterNavigator'
import StakingDashboardNavigator from './components/Delegation/StakingDashboardNavigator'
import SendScreenNavigator from './components/Send/SendScreenNavigator'
import ReceiveScreenNavigator from './components/Receive/ReceiveScreenNavigator'
import FirstRunNavigator from './components/FirstRun/FirstRunNavigator'
import IndexScreen from './components/IndexScreen'
import StorybookScreen from './components/StorybookScreen'
import SplashScreen from './components/SplashScreen'
import MaintenanceScreen from './components/MaintenanceScreen'
import AppStartScreen from './components/Login/AppStartScreen'
import {WALLET_ROUTES, ROOT_ROUTES} from './RoutesList'
import BiometricAuthScreen from './components/Send/BiometricAuthScreen'
import CustomPinLogin from './components/Login/CustomPinLogin'
import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from './navigationOptions'

const _WalletNavigator = createStackNavigator(
  {
    [WALLET_ROUTES.TX_HISTORY]: TxHistoryNavigator,
    [WALLET_ROUTES.SEND]: SendScreenNavigator,
    [WALLET_ROUTES.RECEIVE]: ReceiveScreenNavigator,
    [WALLET_ROUTES.DASHBOARD]: StakingDashboardNavigator,
    [WALLET_ROUTES.DELEGATE]: StakingCenterNavigator,
  },
  {
    // TODO(ppershing): initialRouteName
    // works reversed. Figure out why!
    initialRouteName: WALLET_ROUTES.TX_HISTORY,
    navigationOptions: {
      header: null,
    },
  },
)
const Tab = createBottomTabNavigator()
const WalletNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name={WALLET_ROUTES.WALLET_SELECTION} component={WalletSelectionScreen} />
    <Tab.Navigator initialRouteName={WALLET_ROUTES.TX_HISTORY}>
      <Stack.Screen name={WALLET_ROUTES.TX_HISTORY} component={TxHistoryNavigator} />
      <Stack.Screen name={WALLET_ROUTES.SEND} component={SendScreenNavigator} />
      <Stack.Screen name={WALLET_ROUTES.RECEIVE} component={ReceiveScreenNavigator} />
      <Stack.Screen name={WALLET_ROUTES.DASHBOARD} component={StakingDashboardNavigator} />
      <Stack.Screen name={WALLET_ROUTES.DELEGATE} component={StakingCenterNavigator} />
    </Tab.Navigator>
  </Stack.Navigator>
)

// TODO: remove
const _AppNavigator = // createSwitchNavigator(
[
  {
    [ROOT_ROUTES.SPLASH]: SplashScreen,
    [ROOT_ROUTES.INDEX]: IndexScreen,
    [ROOT_ROUTES.STORYBOOK]: StorybookScreen,
    [ROOT_ROUTES.MAINTENANCE]: MaintenanceScreen,
    [ROOT_ROUTES.FIRST_RUN]: FirstRunNavigator,
    [ROOT_ROUTES.NEW_WALLET]: WalletInitNavigator,
    [ROOT_ROUTES.BIO_AUTH]: BiometricAuthScreen,
    [ROOT_ROUTES.WALLET]: WalletNavigator,
    [ROOT_ROUTES.LOGIN]: createStackNavigator(
      {
        [ROOT_ROUTES.LOGIN]: {
          screen: AppStartScreen,
          navigationOptions: {
            header: null,
          },
        },
        [ROOT_ROUTES.CUSTOM_PIN_AUTH]: CustomPinLogin,
      },
      {
        navigationOptions: ({navigation}) => ({
          title: navigation.getParam('title'),
          headerLeft: <HeaderBackButton navigation={navigation} />,
          ...defaultNavigationOptions,
        }),
        ...defaultStackNavigatorOptions,
      },
    ),
  },
  {
    initialRouteName: ROOT_ROUTES.SPLASH,
  },
]
// )

const Stack = createStackNavigator()
const Drawer = createDrawerNavigator()

const WalletSelectionDrawer = () => (
  <Drawer.Navigator initialRouteName="Home">
    <Drawer.Screen name="Home" component={TxHistoryNavigator} />
  </Drawer.Navigator>
)

const navigatorSwitch = compose(
  connect(
    (state) => ({
      isAppInitialized: isAppInitializedSelector(state),
      isMaintenance: isMaintenanceSelector(state),
      languageCode: languageSelector(state),
      acceptedTos: tosSelector(state),
      isSystemAuthEnabled: isSystemAuthEnabledSelector(state),
      isAuthenticated: isAuthenticatedSelector(state),
      customPinHash: customPinHashSelector(state),
    }),
  ),
)(({
  isAppInitialized,
  isMaintenance,
  languageCode,
  acceptedTos,
  isSystemAuthEnabled,
  isAuthenticated,
  customPinHash,
}) => {
  if (!isAppInitialized) {
    return (
      <Stack.Navigator>
        <Stack.Screen name={ROOT_ROUTES.SPLASH} component={SplashScreen} />
      </Stack.Navigator>
    )
  }
  if (isMaintenance) {
    return (
      <Stack.Navigator>
        <Stack.Screen name={ROOT_ROUTES.MAINTENANCE} component={MaintenanceScreen} />
      </Stack.Navigator>
    )
  }
  if (
    !languageCode ||
    !acceptedTos ||
    (!isSystemAuthEnabled && !customPinHash)
  ) {
    return (
      <FirstRunNavigator />
    )
  }
  return (
    <Stack.Navigator initialRouteName={ROOT_ROUTES.INIT}>
      {CONFIG.DEBUG.START_WITH_INDEX_SCREEN && (
        <>
          <Stack.Screen name={ROOT_ROUTES.INDEX} component={IndexScreen} />
          <Stack.Screen name={ROOT_ROUTES.STORYBOOK} component={StorybookScreen} />
          <Stack.Screen name={ROOT_ROUTES.NEW_WALLET} component={WalletInitNavigator} />
          <Stack.Screen name={ROOT_ROUTES.WALLET} component={WalletNavigator} />
        </>
      )}
      {!isAuthenticated && (
        <Stack.Navigator>
          {/* TODO: should we instead go directly to login screen ? */}
          <Stack.Screen name={ROOT_ROUTES.LOGIN} component={AppStartScreen} />
          <Stack.Screen name={ROOT_ROUTES.CUSTOM_PIN_AUTH} component={CustomPinLogin} />
          <Stack.Screen name={ROOT_ROUTES.BIO_AUTH} component={BiometricAuthScreen} />
        </Stack.Navigator>
      )}
      {isAuthenticated &&
        <Stack.Navigator initialRouteName={ROOT_ROUTES.NEW_WALLET}>
          <Stack.Screen name={ROOT_ROUTES.NEW_WALLET} component={WalletInitNavigator} />
          <Stack.Screen name={ROOT_ROUTES.WALLET} component={WalletNavigator} />
        </Stack.Navigator>
      }
    </Stack.Navigator>
  )
})

const AppNavigator = () => {
  return (
    <NavigationContainer>
      {navigatorSwitch()}
    </NavigationContainer>
  )
}

export default AppNavigator
