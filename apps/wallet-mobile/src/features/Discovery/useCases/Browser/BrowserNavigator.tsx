import {createStackNavigator} from '@react-navigation/stack'
import {Theme, useTheme} from '@yoroi/theme'
import React from 'react'

import {defaultStackNavigationOptions, DiscoverRoutes} from '../../../../navigation'
import {BrowserView} from './BrowserView'

const Stack = createStackNavigator<DiscoverRoutes>()

export const BrowserNavigator = () => {
  const {theme} = useTheme()

  return (
    <Stack.Navigator screenOptions={screenOptions(theme)}>
      <Stack.Screen name="browser-view" component={BrowserView} />
    </Stack.Navigator>
  )
}

const screenOptions = (theme: Theme) => ({
  ...defaultStackNavigationOptions(theme),
  detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
  gestureEnabled: true,
})
