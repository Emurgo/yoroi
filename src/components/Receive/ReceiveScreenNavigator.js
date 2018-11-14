// @flow
import React from 'react'
import {createStackNavigator} from 'react-navigation'
import ReceiveScreen from './ReceiveScreen'
import AddressModal from './AddressModal'
import {RECEIVE_ROUTES} from '../../RoutesList'
import {HeaderBackButton} from 'react-navigation-stack'

const ReceiveScreenNavigator = createStackNavigator(
  {
    [RECEIVE_ROUTES.MAIN]: ReceiveScreen,
    [RECEIVE_ROUTES.ADDRESS_MODAL]: AddressModal,
  },
  {
    initialRouteName: RECEIVE_ROUTES.MAIN,
    navigationOptions: ({navigation}) => ({
      title: navigation.getParam('title'),
      // Nested stack navigators have problems with back button
      // https://github.com/react-navigation/react-navigation/issues/115
      headerLeft: <HeaderBackButton onPress={() => navigation.goBack(null)} />,
    }),
  },
)

export default ReceiveScreenNavigator
