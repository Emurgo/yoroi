// @flow
import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

import {Button} from '../UiKit'
import ReceiveScreen from './ReceiveScreen'
import {RECEIVE_ROUTES, WALLET_ROOT_ROUTES} from '../../RoutesList'
import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'
import iconGear from '../../assets/img/gear.png'

import styles from './styles/SettingsButton.style'

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
    <Stack.Screen
      name={RECEIVE_ROUTES.MAIN}
      component={ReceiveScreen}
      options={({navigation, route}) => ({
        // $FlowFixMe it says optional chain is not required but it is
        title: route.params?.title ?? undefined,
        headerRight: () => (
          <Button
            style={styles.settingsButton}
            onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)}
            iconImage={iconGear}
            title=""
            withoutBackground
          />
        ),
        ...defaultNavigationOptions,
      })}
    />
  </Stack.Navigator>
)

export default ReceiveScreenNavigator
