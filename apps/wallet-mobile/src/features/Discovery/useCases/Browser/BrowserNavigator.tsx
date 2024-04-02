import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import React from 'react'
import {BrowserRoutes} from 'src/navigation'

import {useBrowser} from '../../common/Browser/BrowserProvider'
import {BrowserSearch} from './BrowserSearch'
import {BrowserTabs} from './BrowserTabs'
import {BrowserView} from './BrowserView'

const Tab = createMaterialTopTabNavigator<BrowserRoutes>()

export const BrowserNavigator = () => {
  const {tabs} = useBrowser()

  return (
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
  )
}
