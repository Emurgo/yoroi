// @flow
import {createStackNavigator, createMaterialTopTabNavigator} from 'react-navigation'
import TxHistoryNavigator from './components/TxHistory/TxHistoryNavigator'
import SendScreenNavigator from './components/SendScreen/SendScreenNavigator'

const MAIN_ROUTES = {
  TX_HISTORY: 'history',
  SEND: 'send',
}

const MainNavigator = createMaterialTopTabNavigator(
  {
    [MAIN_ROUTES.TX_HISTORY]: TxHistoryNavigator,
    [MAIN_ROUTES.SEND]: SendScreenNavigator,
  }, {
    // TODO(ppershing): initialRouteName
    // works reversed. Figure out why!
    initialRouteName: MAIN_ROUTES.SEND,
    tabBarPosition: 'bottom',
  }
)

const AppNavigator = createStackNavigator({
  // login: LoginNavigator,
  main: MainNavigator,
}, {
  initialRouteName: 'main',
  navigationOptions: ({navigation}) => ({
    header: null,
  }),
})

export default AppNavigator
