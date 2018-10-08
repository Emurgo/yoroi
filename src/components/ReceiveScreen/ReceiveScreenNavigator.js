// @flow

import {createStackNavigator} from 'react-navigation'
import ReceiveScreen from './ReceiveScreen'

const RECEIVE_ROUTES = {
  MAIN: 'main',
}

const ReceiveScreenNavigator = createStackNavigator({
  [RECEIVE_ROUTES.MAIN]: ReceiveScreen,
}, {
  initialRouteName: RECEIVE_ROUTES.MAIN,
  navigationOptions: ({navigation}) => ({
    title: 'Receive ADA',
  }),
})

export default ReceiveScreenNavigator
