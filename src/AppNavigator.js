// @flow
import {createStackNavigator} from 'react-navigation'
import WalletInitNavigator from './components/WalletInit/WalletInitNavigator'
import TxHistoryNavigator from './components/TxHistory/TxHistoryNavigator'
import SendScreenNavigator from './components/Send/SendScreenNavigator'
import ReceiveScreenNavigator from './components/Receive/ReceiveScreenNavigator'
import IndexScreen from './components/IndexScreen'
import LoginScreen from './components/Login/LoginScreen'
import {MAIN_ROUTES, ROOT_ROUTES} from './RoutesList'

const MainNavigator = createStackNavigator(
  {
    [MAIN_ROUTES.TX_HISTORY]: TxHistoryNavigator,
    [MAIN_ROUTES.SEND]: SendScreenNavigator,
    [MAIN_ROUTES.RECEIVE]: ReceiveScreenNavigator,
  },
  {
    // TODO(ppershing): initialRouteName
    // works reversed. Figure out why!
    initialRouteName: MAIN_ROUTES.TX_HISTORY,
    navigationOptions: {
      header: null,
    },
  },
)

const AppNavigator = createStackNavigator(
  {
    [ROOT_ROUTES.LOGIN]: LoginScreen,
    [ROOT_ROUTES.MAIN]: MainNavigator,
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
