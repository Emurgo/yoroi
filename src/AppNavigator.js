// @flow
import {createStackNavigator, createSwitchNavigator} from 'react-navigation'
import WalletInitNavigator from './components/WalletInit/WalletInitNavigator'
import TxHistoryNavigator from './components/TxHistory/TxHistoryNavigator'
import SendScreenNavigator from './components/Send/SendScreenNavigator'
import ReceiveScreenNavigator from './components/Receive/ReceiveScreenNavigator'
// eslint-disable-next-line max-len
import SettingsScreenNavigator from './components/Settings/SettingsScreenNavigator'
import IndexScreen from './components/IndexScreen'
import LoginScreen from './components/Login/LoginScreen'
import {WALLET_ROUTES, ROOT_ROUTES} from './RoutesList'

const WalletNavigator = createStackNavigator(
  {
    [WALLET_ROUTES.TX_HISTORY]: TxHistoryNavigator,
    [WALLET_ROUTES.SEND]: SendScreenNavigator,
    [WALLET_ROUTES.RECEIVE]: ReceiveScreenNavigator,
    [WALLET_ROUTES.SETTINGS]: SettingsScreenNavigator,
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

const AppNavigator = createSwitchNavigator(
  {
    [ROOT_ROUTES.LOGIN]: LoginScreen,
    [ROOT_ROUTES.WALLET]: WalletNavigator,
    [ROOT_ROUTES.INIT]: WalletInitNavigator,
    [ROOT_ROUTES.INDEX]: IndexScreen,
  },
  {
    initialRouteName: ROOT_ROUTES.INDEX,
    navigationOptions: {
      header: null,
    },
  },
)

export default AppNavigator
