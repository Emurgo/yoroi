// @flow
import {createStackNavigator, createSwitchNavigator} from 'react-navigation'

import WalletInitNavigator from './components/WalletInit/WalletInitNavigator'
import TxHistoryNavigator from './components/TxHistory/TxHistoryNavigator'
import SendScreenNavigator from './components/Send/SendScreenNavigator'
import ReceiveScreenNavigator from './components/Receive/ReceiveScreenNavigator'
import FirstRunNavigator from './components/FirstRun/FirstRunNavigator'
import IndexScreen from './components/IndexScreen'
import SplashScreen from './components/SplashScreen'
import AppStartScreen from './components/Login/AppStartScreen'
import {WALLET_ROUTES, ROOT_ROUTES} from './RoutesList'
import BiometricAuthScreen from './components/Send/BiometricAuthScreen'
import CustomPinLogin from './components/Login/CustomPinLogin'
import {
  defaultStackNavigatorOptions,
  backButtonNavigatorOptions,
} from './utils/navigation'

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

const LoginNavigator = createStackNavigator(
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
    navigationOptions: backButtonNavigatorOptions,
    ...defaultStackNavigatorOptions,
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
    [ROOT_ROUTES.LOGIN]: LoginNavigator,
  },
  {
    initialRouteName: ROOT_ROUTES.SPLASH,
  },
)

export default AppNavigator
