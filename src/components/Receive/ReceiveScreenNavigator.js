// @flow

import {createStackNavigator} from 'react-navigation'
import ReceiveScreen from './ReceiveScreen'
import AddressModal from './AddressModal'
import {RECEIVE_ROUTES} from '../../RoutesList'

const ReceiveScreenNavigator = createStackNavigator(
  {
    [RECEIVE_ROUTES.MAIN]: ReceiveScreen,
    [RECEIVE_ROUTES.ADDRESS_MODAL]: AddressModal,
  },
  {
    initialRouteName: RECEIVE_ROUTES.MAIN,
    navigationOptions: ({navigation}) => ({
      title: 'i18nReceive',
    }),
  },
)

export default ReceiveScreenNavigator
