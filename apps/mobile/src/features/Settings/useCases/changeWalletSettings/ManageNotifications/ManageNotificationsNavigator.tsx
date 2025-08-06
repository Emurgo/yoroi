import {createStackNavigator} from '@react-navigation/stack'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '../../../../../kernel/navigation/common/helpers'
import {ManageNotificationsRoutes} from '../../../../../kernel/navigation/types'
import {ManageNotificationDisplayDurationScreen} from './ManageNotificationDisplayDuration/ManageNotificationDisplayDurationScreen'
import {ManageNotificationSettings} from './ManageNotificationSettings/ManageNotificationSettings'

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
        options={{title: strings.settings.notifications}}
      />

      <Stack.Screen //
        name="manage-notification-display-duration"
        component={ManageNotificationDisplayDurationScreen}
        options={{title: strings.settings.manageDisplayDurationScreenTitle}}
      />
    </Stack.Navigator>
  )
}
