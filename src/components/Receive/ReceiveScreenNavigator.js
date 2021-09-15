// @flow

import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import {useIntl, defineMessages} from 'react-intl'

import {Button} from '../UiKit'
import ReceiveScreen from './ReceiveScreen'
import {RECEIVE_ROUTES, WALLET_ROOT_ROUTES} from '../../RoutesList'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../navigationOptions'
import iconGear from '../../assets/img/gear.png'

import styles from './styles/SettingsButton.style'

type ReceiveScreenNavigatorRoute = {
  'receive-ada': {title: string},
}

const messages = defineMessages({
  receiveTitle: {
    id: 'components.receive.receivescreen.title',
    defaultMessage: '!!!Receive',
  },
})

const Stack = createStackNavigator<any, ReceiveScreenNavigatorRoute, any>()

const ReceiveScreenNavigator = () => {
  const intl = useIntl()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultNavigationOptions,
        ...defaultStackNavigatorOptions,
      }}
      initialRouteName={RECEIVE_ROUTES.MAIN}
    >
      <Stack.Screen
        name={RECEIVE_ROUTES.MAIN}
        component={ReceiveScreen}
        options={({navigation}) => ({
          title: intl.formatMessage(messages.receiveTitle),
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
}

export default ReceiveScreenNavigator
