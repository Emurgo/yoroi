// @flow

import {createStackNavigator} from 'react-navigation'
import SendScreen from './SendScreen'

const SEND_ROUTES = {
  MAIN: 'main',
}

const SendScreenNavigator = createStackNavigator({
  [SEND_ROUTES.MAIN]: SendScreen,
}, {
  initialRouteName: SEND_ROUTES.MAIN,
  navigationOptions: ({navigation}) => ({
    title: 'Send ADA',
  }),
})

export default SendScreenNavigator
