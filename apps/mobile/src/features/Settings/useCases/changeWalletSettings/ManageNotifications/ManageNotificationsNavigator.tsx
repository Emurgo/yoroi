import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'

import {
  defaultStackNavigationOptions,
  ManageNotificationsRoutes,
} from '../../../../../kernel/navigation'
import {ManageNotificationDisplayDurationScreen} from './ManageNotificationDisplayDuration/ManageNotificationDisplayDurationScreen'
import {ManageNotificationSettings} from './ManageNotificationSettings/ManageNotificationSettings'
import {useStrings} from './useStrings'

const Stack = createStackNavigator<ManageNotificationsRoutes>()

export const ManageNotificationsNavigator = () => {
  const {atoms, color} = useTheme()
  const strings = useStrings()

  return (
    <Stack.Navigator
      initialRouteName="manage-notification-settings"
      screenOptions={{
        ...defaultStackNavigationOptions(atoms, color),
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
