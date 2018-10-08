// @flow

import {createStackNavigator} from 'react-navigation'
import ReceiveScreen from './ReceiveScreen'

const SEND_ROUTES = {
  MAIN: 'main',
}

const ReceiveScreenNavigator = createStackNavigator({
  [SEND_ROUTES.MAIN]: ReceiveScreen,
}, {
  initialRouteName: SEND_ROUTES.MAIN,
  navigationOptions: ({navigation}) => ({
    title: 'Receive ADA',
  }),
})

export default ReceiveScreenNavigator
