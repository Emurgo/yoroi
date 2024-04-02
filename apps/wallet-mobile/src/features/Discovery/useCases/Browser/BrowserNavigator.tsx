import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'
import {BrowserRoutes} from 'src/navigation'

import {useBrowser} from '../../common/Browser/BrowserProvider'
import {BrowserSearch} from './BrowserSearch'
import {BrowserTabs} from './BrowserTabs'
import {BrowserView} from './BrowserView'

const Tab = createMaterialTopTabNavigator<BrowserRoutes>()

export const BrowserNavigator = () => {
  const {tabs} = useBrowser()
  const {styles} = useStyles()

  return (
    <View style={styles.root}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            height: 0,
          },
          swipeEnabled: false,
          animationEnabled: false,
        }}
      >
        {tabs.map((tab) => (
          <Tab.Screen name={`browser-view-${tab.id}`} component={BrowserView} key={tab.id} />
        ))}

        <Tab.Screen name="browser-tabs" component={BrowserTabs} />

        <Tab.Screen name="browser-search" component={BrowserSearch} />
      </Tab.Navigator>
    </View>
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
