// @flow
import {createStackNavigator} from 'react-navigation'

import ReceiveScreen from './ReceiveScreen'
import {RECEIVE_ROUTES} from '../../RoutesList'
import {
  defaultStackNavigatorOptions,
  backButtonNavigatorOptions,
} from '../../utils/navigation'

const ReceiveScreenNavigator = createStackNavigator(
  {
    [RECEIVE_ROUTES.MAIN]: ReceiveScreen,
  },
  {
    initialRouteName: RECEIVE_ROUTES.MAIN,
    navigationOptions: backButtonNavigatorOptions,
    ...defaultStackNavigatorOptions,
  },
)

export default ReceiveScreenNavigator
