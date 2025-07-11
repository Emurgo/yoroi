import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {BrowserRoutes} from 'src/kernel/navigation'

import {BrowseDappScreen} from './useCases/BrowseDapp/BrowseDappScreen'
import {SearchDappInBrowserScreen} from './useCases/SearchDappInBrowser/SearchDappInBrowserScreen'

const Tab = createStackNavigator<BrowserRoutes>()

export const BrowserNavigator = () => {
  const {palette: p} = useTheme()

  return (
    <SafeAreaView
      edges={['left', 'right', 'top']}
      style={[{flex: 1}, {backgroundColor: p.bg_color_max}]}
    >
      <Tab.Navigator
        screenOptions={{animationEnabled: false, headerShown: false}}
      >
        <Tab.Screen name="discover-browse-dapp" component={BrowseDappScreen} />

        <Tab.Screen
          name="discover-search-dapp-in-browser"
          component={SearchDappInBrowserScreen}
        />
      </Tab.Navigator>
    </SafeAreaView>
  )
}
