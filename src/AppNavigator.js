// @flow
import {createStackNavigator} from 'react-navigation'
import WalletInitNavigator from './components/WalletInit/WalletInitNavigator'
import TxHistoryNavigator from './components/TxHistory/TxHistoryNavigator'
import SendScreenNavigator from './components/Send/SendScreenNavigator'
import ReceiveScreenNavigator from './components/Receive/ReceiveScreenNavigator'

export const MAIN_ROUTES = {
  TX_HISTORY: 'history',
  SEND: 'send',
  RECEIVE: 'receive',
}

const MainNavigator = createStackNavigator(
  {
    [MAIN_ROUTES.TX_HISTORY]: TxHistoryNavigator,
    [MAIN_ROUTES.SEND]: SendScreenNavigator,
    [MAIN_ROUTES.RECEIVE]: ReceiveScreenNavigator,
  }, {
    // TODO(ppershing): initialRouteName
    // works reversed. Figure out why!
    initialRouteName: MAIN_ROUTES.TX_HISTORY,
    navigationOptions: {
      header: null,
    },
  }
)

export const ROOT_ROUTES = {
  MAIN: 'main',
  INIT: 'init',
}

const AppNavigator = createStackNavigator({
  // login: LoginNavigator,
  [ROOT_ROUTES.MAIN]: MainNavigator,
  [ROOT_ROUTES.INIT]: WalletInitNavigator,
}, {
  initialRouteName: 'init',
  navigationOptions: {
    header: null,
  },
})

export default AppNavigator
