import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {RECEIVE_ROUTES, WALLET_ROOT_ROUTES} from '../../legacy/RoutesList'
import {SettingsButton} from '../components/Button'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../navigationOptions'
import {ReceiveScreen} from './ReceiveScreen'

const Stack = createStackNavigator<{
  'receive-ada': {title: string}
}>()

export const ReceiveScreenNavigator = () => {
  const strings = useStrings()

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
          title: strings.receiveTitle,
          headerRight: () => <SettingsButton onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)} />,
          headerRightContainerStyle: {paddingRight: 16},
          ...defaultNavigationOptions,
        })}
      />
    </Stack.Navigator>
  )
}

const messages = defineMessages({
  receiveTitle: {
    id: 'components.receive.receivescreen.title',
    defaultMessage: '!!!Receive',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    receiveTitle: intl.formatMessage(messages.receiveTitle),
  }
}
