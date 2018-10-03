// @flow
import {createStackNavigator} from 'react-navigation'
import TxHistoryNavigator from './components/TxHistoryScreen/TxHistoryNavigator'
import SendScreenNavigator from './components/SendScreen/SendScreenNavigator'

const MAIN_ROUTES = {
  TX_HISTORY: 'history',
  SEND: 'send',
}

const MainNavigator = createStackNavigator(
  {
    [MAIN_ROUTES.TX_HISTORY]: TxHistoryNavigator,
    [MAIN_ROUTES.SEND]: SendScreenNavigator,
  }, {
    // TODO(ppershing): initialRouteName
    // works reversed. Figure out why!
    initialRouteName: MAIN_ROUTES.TX_HISTORY,
    navigationOptions: {
      header: null,
    },
  }
)

const AppNavigator = createStackNavigator({
  // login: LoginNavigator,
  main: MainNavigator,
}, {
  initialRouteName: 'main',
  navigationOptions: {
    header: null,
  },
})

export default AppNavigator
