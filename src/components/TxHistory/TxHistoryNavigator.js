// @flow

import {createStackNavigator} from 'react-navigation'
import TxHistory from './TxHistory'
import TxDetails from './TxDetails'

export const TX_HISTORY_ROUTES = {
  MAIN: 'main',
  TX_DETAIL: 'tx_details',
}

const TxHistoryNavigator = createStackNavigator({
  [TX_HISTORY_ROUTES.MAIN]: TxHistory,
  [TX_HISTORY_ROUTES.TX_DETAIL]: TxDetails,
}, {
  initialRouteName: TX_HISTORY_ROUTES.MAIN,
})

export default TxHistoryNavigator
