import {useTheme} from '@yoroi/theme'

import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {ToggleAnalyticsSettingsRoutes} from '~/kernel/navigation/types'

import {ToggleAnalyticsSettingsScreen} from './ToggleAnalyticsSettingsScreen'

const Stack = createStackNavigator<ToggleAnalyticsSettingsRoutes>()

export const ToggleAnalyticsSettingsNavigator = () => {
  const strings = useStrings()

  const {palette: p} = useTheme()

  const navigationOptions = React.useMemo(
    () => defaultStackNavigationOptions(p),
    [p],
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
