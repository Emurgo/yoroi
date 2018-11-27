// @flow
import React from 'react'
import {createStackNavigator} from 'react-navigation'

import ReceiveScreen from './ReceiveScreen'
import {RECEIVE_ROUTES} from '../../RoutesList'
import HeaderBackButton from '../UiKit/HeaderBackButton'
import {defaultNavigationOptions} from '../../navigationOptions'

const ReceiveScreenNavigator = createStackNavigator(
  {
    [RECEIVE_ROUTES.MAIN]: ReceiveScreen,
  },
  {
    initialRouteName: RECEIVE_ROUTES.MAIN,
    navigationOptions: ({navigation}) => ({
      title: navigation.getParam('title'),
      // Nested stack navigators have problems with back button
      // https://github.com/react-navigation/react-navigation/issues/115
      headerLeft: <HeaderBackButton navigation={navigation} />,
      ...defaultNavigationOptions,
    }),
  },
)

export default ReceiveScreenNavigator
