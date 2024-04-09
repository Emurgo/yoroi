import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {BrowserRoutes} from 'src/navigation'

import {BrowseDappScreen} from './useCases/BrowseDappScreen/BrowseDappScreen'
import {BrowseSearchDappScreen} from './useCases/BrowseSearchDappScreen/BrowseSearchDappScreen'

const Tab = createStackNavigator<BrowserRoutes>()

export const BrowserNavigator = () => {
  const {styles} = useStyles()

  return (
    <SafeAreaView edges={['left', 'right', 'top']} style={styles.root}>
      <Tab.Navigator
        screenOptions={{
          animationEnabled: false,
          headerShown: false,
        }}
      >
        <Tab.Screen name="browser-view" component={BrowseDappScreen} />

        <Tab.Screen name="browser-search" component={BrowseSearchDappScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
    },
  })

  return {styles} as const
}
