// @flow
import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

import ReceiveScreen from './ReceiveScreen'
import {RECEIVE_ROUTES} from '../../RoutesList'
import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'

const Stack = createStackNavigator()

const ReceiveScreenNavigator = () => (
  <Stack.Navigator
    screenOptions={({route}) => ({
      title: route.params?.title ?? undefined,
      ...defaultNavigationOptions,
      ...defaultStackNavigatorOptions,
    })}
    initialRouteName={RECEIVE_ROUTES.MAIN}
  >
    <Stack.Screen name={RECEIVE_ROUTES.MAIN} component={ReceiveScreen} />
  </Stack.Navigator>
)

export default ReceiveScreenNavigator
