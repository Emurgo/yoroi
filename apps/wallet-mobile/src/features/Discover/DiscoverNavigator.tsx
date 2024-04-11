import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'

import {defaultStackNavigationOptions, DiscoverRoutes} from '../../navigation'
import {BrowserNavigator} from './BrowserNavigator'
import {BrowserProvider} from './common/BrowserProvider'
import {useStrings} from './common/useStrings'
import {SelectDappFromListScreen} from './useCases/SelectDappFromList/SelectDappFromListScreen'

const Stack = createStackNavigator<DiscoverRoutes>()

export const DiscoverNavigator = () => {
  const {theme} = useTheme()
  const strings = useStrings()

  return (
    <BrowserProvider>
      <Stack.Navigator
        screenOptions={{
          ...defaultStackNavigationOptions(theme),
          headerLeft: () => null,
          detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
          gestureEnabled: true,
        }}
        initialRouteName="select-dapp-from-list"
      >
        <Stack.Screen
          name="select-dapp-from-list"
          component={SelectDappFromListScreen}
          options={{
            title: strings.discoverTitle,
          }}
        />

        <Stack.Screen
          name="browser"
          component={BrowserNavigator}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </BrowserProvider>
  )
}
