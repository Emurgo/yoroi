// @flow
import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

import ReceiveScreen from './ReceiveScreen'
import {RECEIVE_ROUTES} from '../../RoutesList'
import HeaderBackButton from '../UiKit/HeaderBackButton'
import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'

const _ReceiveScreenNavigator = createStackNavigator(
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
    ...defaultStackNavigatorOptions,
  },
)

const Stack = createStackNavigator()

// TODO
const ReceiveScreenNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name={RECEIVE_ROUTES.MAIN} component={ReceiveScreen} />
  </Stack.Navigator>
)

export default ReceiveScreenNavigator
