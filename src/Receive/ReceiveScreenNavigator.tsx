import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {SettingsButton} from '../components/Button'
import {defaultStackNavigationOptions, ReceiveRoutes, useWalletNavigation} from '../navigation'
import {ReceiveScreen} from './ReceiveScreen'

const Stack = createStackNavigator<ReceiveRoutes>()
export const ReceiveScreenNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator screenOptions={defaultStackNavigationOptions} initialRouteName="receive-ada-main">
      <Stack.Screen
        name="receive-ada-main"
        component={ReceiveScreen}
        options={{
          title: strings.receiveTitle,
          headerRight: () => <HeaderRight />,
          headerRightContainerStyle: {paddingRight: 16},
        }}
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

const HeaderRight = () => {
  const {navigateToSettings} = useWalletNavigation()

  return <SettingsButton onPress={() => navigateToSettings()} />
}
