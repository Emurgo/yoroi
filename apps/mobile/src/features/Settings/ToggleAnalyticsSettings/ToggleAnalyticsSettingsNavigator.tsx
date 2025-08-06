import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {
  defaultStackNavigationOptions,
  ToggleAnalyticsSettingsRoutes,
} from '~/kernel/navigation/navigation'
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
        options={{
          title: strings.settings.toggleAnalytics.toggleAnalyticsSettingsTitle,
        }}
      />
    </Stack.Navigator>
  )
}
