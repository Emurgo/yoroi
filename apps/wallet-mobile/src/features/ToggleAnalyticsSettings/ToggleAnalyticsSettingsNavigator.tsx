import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {defaultStackNavigationOptions, ToggleAnalyticsSettingsRoutes} from '../../navigation'
import {ToggleAnalyticsSettingsScreen} from './ToggleAnalyticsSettingsScreen'

const Stack = createStackNavigator<ToggleAnalyticsSettingsRoutes>()

export const ToggleAnalyticsSettingsNavigator = () => {
  const strings = useStrings()
  const {theme} = useTheme()
  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptions(theme),
        detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
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
