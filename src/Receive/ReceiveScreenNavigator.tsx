import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {SettingsButton} from '../components/Button'
import {AppRouteParams, defaultNavigationOptions, defaultStackNavigatorOptions, ReceiveRoutes} from '../navigation'
import {ReceiveScreen} from './ReceiveScreen'

const Stack = createStackNavigator<ReceiveRoutes>()
export const ReceiveScreenNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultNavigationOptions,
        ...defaultStackNavigatorOptions,
      }}
      initialRouteName="receive-ada-main"
    >
      <Stack.Screen
        name="receive-ada-main"
        component={ReceiveScreen}
        options={({navigation}: {navigation: AppRouteParams}) => ({
          title: strings.receiveTitle,
          headerRight: () => (
            <SettingsButton
              onPress={() =>
                navigation.navigate('app-root', {
                  screen: 'settings',
                  params: {
                    screen: 'settings-main',
                  },
                })
              }
            />
          ),
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
