import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'

import {
  defaultStackNavigationOptions,
  ToggleAnalyticsSettingsRoutes,
} from '~/kernel/navigation'
import {useStrings} from '~/kernel/i18n/useStrings'
import {ToggleAnalyticsSettingsScreen} from './ToggleAnalyticsSettingsScreen'

const Stack = createStackNavigator<ToggleAnalyticsSettingsRoutes>()

export const ToggleAnalyticsSettingsNavigator = () => {
  const strings = useStrings()

  const {atoms, palette: p} = useTheme()

  const navigationOptions = React.useMemo(
    () => defaultStackNavigationOptions(atoms, p),
    [atoms, p],
  )

  return (
    <Stack.Navigator
      screenOptions={{
        ...navigationOptions,
      }}
    >
      <Stack.Screen
        name="settings"
        component={ToggleAnalyticsSettingsScreen}
        options={{title: strings.settings.toggleAnalytics.toggleAnalyticsSettingsTitle}}
      />
    </Stack.Navigator>
  )
}
