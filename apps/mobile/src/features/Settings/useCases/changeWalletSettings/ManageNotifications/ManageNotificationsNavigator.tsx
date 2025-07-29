import {createStackNavigator} from '@react-navigation/stack'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'

import {
  defaultStackNavigationOptions,
  ManageNotificationsRoutes,
} from '../../../../../kernel/navigation/navigation'
import {ManageNotificationDisplayDurationScreen} from './ManageNotificationDisplayDuration/ManageNotificationDisplayDurationScreen'
import {ManageNotificationSettings} from './ManageNotificationSettings/ManageNotificationSettings'
import {useStrings} from './useStrings'

const Stack = createStackNavigator<ManageNotificationsRoutes>()

export const ManageNotificationsNavigator = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <Stack.Navigator
      initialRouteName="manage-notification-settings"
      screenOptions={{
        ...defaultStackNavigationOptions(a, p),
      }}
    >
      <Stack.Screen //
        name="manage-notification-settings"
        component={ManageNotificationSettings}
        options={{title: strings.notifications}}
      />

      <Stack.Screen //
        name="manage-notification-display-duration"
        component={ManageNotificationDisplayDurationScreen}
        options={{title: strings.manageDisplayDurationScreenTitle}}
      />
    </Stack.Navigator>
  )
}
