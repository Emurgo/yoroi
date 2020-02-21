// @flow
import React from 'react'
import {createStackNavigator, createSwitchNavigator} from 'react-navigation'

import HeaderBackButton from './components/UiKit/HeaderBackButton'
import WalletInitNavigator from './components/WalletInit/WalletInitNavigator'
import TxHistoryNavigator from './components/TxHistory/TxHistoryNavigator'
import DelegationNavigatorSummary from './components/Delegation/DelegationNavigatorSummary'
import DelegationNavigatorCenter from './components/Delegation/DelegationNavigatorCenter'
import SendScreenNavigator from './components/Send/SendScreenNavigator'
import ReceiveScreenNavigator from './components/Receive/ReceiveScreenNavigator'
import FirstRunNavigator from './components/FirstRun/FirstRunNavigator'
import IndexScreen from './components/IndexScreen'
import SplashScreen from './components/SplashScreen'
import AppStartScreen from './components/Login/AppStartScreen'
import {WALLET_ROUTES, SHELLEY_WALLET_ROUTES, ROOT_ROUTES} from './RoutesList'
import BiometricAuthScreen from './components/Send/BiometricAuthScreen'
import CustomPinLogin from './components/Login/CustomPinLogin'
import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from './navigationOptions'

const WalletNavigator = createStackNavigator(
  {
    [WALLET_ROUTES.TX_HISTORY]: TxHistoryNavigator,
    [WALLET_ROUTES.SEND]: SendScreenNavigator,
    [WALLET_ROUTES.RECEIVE]: ReceiveScreenNavigator,
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

const ShelleyWalletNavigator = createStackNavigator(
  {
    [SHELLEY_WALLET_ROUTES.DELEGATION_SUMMARY]: DelegationNavigatorSummary,
    [SHELLEY_WALLET_ROUTES.STAKING_CENTER]: DelegationNavigatorCenter,
  },
  {
    // TODO(ppershing): initialRouteName
    // works reversed. Figure out why!
    initialRouteName: SHELLEY_WALLET_ROUTES.DELEGATION_SUMMARY,
    navigationOptions: {
      header: null,
    },
  },
)

const AppNavigator = createSwitchNavigator(
  {
    [ROOT_ROUTES.SPLASH]: SplashScreen,
    [ROOT_ROUTES.INDEX]: IndexScreen,
    [ROOT_ROUTES.FIRST_RUN]: FirstRunNavigator,
    [ROOT_ROUTES.NEW_WALLET]: WalletInitNavigator,
    [ROOT_ROUTES.BIO_AUTH]: BiometricAuthScreen,
    [ROOT_ROUTES.WALLET]: WalletNavigator,
    [ROOT_ROUTES.SHELLEY_WALLET]: ShelleyWalletNavigator,
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
)

export default AppNavigator
