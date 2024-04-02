import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'

import {defaultStackNavigationOptions, DiscoverRoutes} from '../../navigation'
import {useStrings} from './common/useStrings'
import {DiscoverList} from './useCases/DiscoverList/DiscoverList'

const Stack = createStackNavigator<DiscoverRoutes>()

export const DiscoverNavigator = () => {
  const {theme} = useTheme()
  const strings = useStrings()

  return (
    <Stack.Navigator
      screenListeners={{}}
      screenOptions={{
        ...defaultStackNavigationOptions(theme),
        headerLeft: () => null,
        detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
        gestureEnabled: true,
      }}
      initialRouteName="discover-list"
    >
      <Stack.Screen
        name="discover-list"
        component={DiscoverList}
        options={{
          title: strings.discoverTitle,
        }}
      />
    </Stack.Navigator>
  )
}
