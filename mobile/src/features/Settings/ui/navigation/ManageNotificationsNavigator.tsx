import {useTheme} from '@yoroi/theme'

import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {ManageNotificationsRoutes} from '~/kernel/navigation/types'

import {ChangeNotificationSettingsScreen} from '../screens/ChangeWalletSettingsScreen/ChangeNotificationsSettingsScreen/ChangeNotificationSettingsScreen'
import {ManageNotificationDisplayDurationScreen} from '../screens/ChangeWalletSettingsScreen/ChangeNotificationsSettingsScreen/ManageNotificationDisplayDurationScreen/ManageNotificationDisplayDurationScreen'

const Stack = createStackNavigator<ManageNotificationsRoutes>()

export const ManageNotificationsNavigator = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <Stack.Navigator
      initialRouteName="manage-notification-settings"
      screenOptions={{
        ...defaultStackNavigationOptions(p),
      }}
    >
      <Stack.Screen //
        name="manage-notification-settings"
        component={ChangeNotificationSettingsScreen}
        options={{title: strings.manageNotifications.notifications}}
      />

      <Stack.Screen //
        name="manage-notification-display-duration"
        component={ManageNotificationDisplayDurationScreen}
        options={{
          title: strings.manageNotifications.manageDisplayDurationScreenTitle,
        }}
      />
    </Stack.Navigator>
  )
}
