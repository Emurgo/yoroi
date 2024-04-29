import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {BrowserRoutes} from 'src/navigation'

import {BrowseDappScreen} from './useCases/BrowseDapp/BrowseDappScreen'
import {SearchDappInBrowserScreen} from './useCases/SearchDappInBrowser/SearchDappInBrowserScreen'

const Tab = createStackNavigator<BrowserRoutes>()

export const BrowserNavigator = () => {
  const {styles} = useStyles()

  return (
    <SafeAreaView edges={['left', 'right', 'top']} style={styles.root}>
      <Tab.Navigator screenOptions={{animationEnabled: false, headerShown: false}}>
        <Tab.Screen name="discover-browse-dapp" component={BrowseDappScreen} />

        <Tab.Screen name="discover-search-dapp-in-browser" component={SearchDappInBrowserScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.white_static,
    },
  })

  return {styles} as const
}
