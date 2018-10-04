import {createStackNavigator} from 'react-navigation'
import TxHistory from './TxHistory'

const TX_HISTORY_ROUTES = {
  MAIN: 'main',
}

const TxHistoryNavigator = createStackNavigator({
  [TX_HISTORY_ROUTES.MAIN]: TxHistory,
}, {
  initialRouteName: TX_HISTORY_ROUTES.MAIN,
})

export default TxHistoryNavigator
