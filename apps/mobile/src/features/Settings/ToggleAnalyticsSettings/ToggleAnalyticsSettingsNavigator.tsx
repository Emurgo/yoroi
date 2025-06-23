import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {defaultStackNavigationOptions, ToggleAnalyticsSettingsRoutes} from '../../kernel/navigation'
import {ToggleAnalyticsSettingsScreen} from './ToggleAnalyticsSettingsScreen'

const Stack = createStackNavigator<ToggleAnalyticsSettingsRoutes>()

export const ToggleAnalyticsSettingsNavigator = () => {
  const strings = useStrings()

  const {atoms, color} = useTheme()

  const navigationOptions = React.useMemo(() => defaultStackNavigationOptions(atoms, color), [atoms, color])

  return (
    <Stack.Navigator
      screenOptions={{
        ...navigationOptions,
      }}
    >
      <Stack.Screen
        name="settings"
        component={ToggleAnalyticsSettingsScreen}
        options={{title: strings.toggleAnalyticsSettingsTitle}}
      />
    </Stack.Navigator>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    toggleAnalyticsSettingsTitle: intl.formatMessage(messages.userInsights),
  }
}

const messages = defineMessages({
  userInsights: {
    id: 'toggleAnalyticsSettings.analyticsTitle',
    defaultMessage: '!!!User Insights',
  },
})
