// @flow
import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

import ReceiveScreen from './ReceiveScreen'
import {RECEIVE_ROUTES} from '../../RoutesList'
import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'

type ReceiveScreenNavigatorRoute = {
  'receive-ada': {title: string},
}

const Stack = createStackNavigator<any, ReceiveScreenNavigatorRoute, any>()

const ReceiveScreenNavigator = () => (
  <Stack.Navigator
    screenOptions={({route}) => ({
      // $FlowFixMe mixed is incompatible with string
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
