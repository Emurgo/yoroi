// @flow

import {createStackNavigator} from 'react-navigation'
import SendScreen from './SendScreen'
import ConfirmScreen from './ConfirmScreen'
import {SEND_ROUTES} from '../../RoutesList'

const SendScreenNavigator = createStackNavigator({
  [SEND_ROUTES.MAIN]: SendScreen,
  [SEND_ROUTES.CONFIRM]: ConfirmScreen,
}, {
  initialRouteName: SEND_ROUTES.MAIN,
  navigationOptions: ({navigation}) => ({
    title: 'i18nSend ADA',
  }),
})

export default SendScreenNavigator
