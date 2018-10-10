// @flow

import {createStackNavigator} from 'react-navigation'
import SendScreen from './SendScreen'
import {SEND_ROUTES} from '../../RoutesList'

const SendScreenNavigator = createStackNavigator({
  [SEND_ROUTES.MAIN]: SendScreen,
}, {
  initialRouteName: SEND_ROUTES.MAIN,
  navigationOptions: ({navigation}) => ({
    title: 'i18nSend ADA',
  }),
})

export default SendScreenNavigator
