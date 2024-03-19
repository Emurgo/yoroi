import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'

import {defaultStackNavigationOptions} from '../../navigation'
import {useStrings} from './common/useStrings'
import {DiscoverList} from './useCases/DiscoverList/DiscoverList'

const Stack = createStackNavigator()

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
      initialRouteName="discover"
    >
      <Stack.Screen
        name="discover"
        component={DiscoverList}
        options={{
          title: strings.discoverTitle,
          // headerRight: () => <Icon
        }}
      />
    </Stack.Navigator>
  )
}
