import React from 'react'
import {NavigationContext, NavigationProp, NavigationRouteContext, RouteProp} from '@react-navigation/native'
import {action} from '@storybook/addon-actions'

import {StackNavigationProp} from '@react-navigation/stack'
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs'

export const navigation = {
  setParams: action('setParams'),
  setOptions: action('setOptions'),

  // NavigationHelpers
  dispatch: action('dispatch'),
  navigate: action('navigate'),
  reset: action('reset'),
  goBack: action('goBack'),
  isFocused: (...args) => {
    action('isFocused')

    return true
  },
  canGoBack: (...args) => {
    action('canGoBack')

    return true
  },

  // EventConsumer
  addListener: (event: string) => {
    action('addListener')(event)

    return () => action('unsubscribe')(event)
  },
  removeListener: action('removeListener'),
}

export const stackNavigation: Partial<StackNavigationProp<any>> = {
  ...navigation,
  replace: action('replace'),
  push: action('push'),
  pop: action('pop'),
  popToTop: action('popToTop'),
}

export const tabNavigation: Partial<BottomTabNavigationProp<any>> = {
  ...navigation,
  jumpTo: action('jumpTo'),
}

export const CommonNavigationProvider = ({children}: {children: React.ReactNode}) => (
  <NavigationContext.Provider value={navigation as any}>{children}</NavigationContext.Provider>
)

export const StackNavigationProvider = ({children}: {children: React.ReactNode}) => (
  <NavigationContext.Provider value={stackNavigation as NavigationProp<any>}>{children}</NavigationContext.Provider>
)

export const TabNavigationProvider = ({children}: {children: React.ReactNode}) => (
  <NavigationContext.Provider value={tabNavigation as NavigationProp<any>}>{children}</NavigationContext.Provider>
)

const route = {
  key: 'route.key',
  name: 'route.name',
}

export const RouteProvider: React.FC<{params?: Record<string, unknown>}> = ({children, params}) => (
  <NavigationRouteContext.Provider value={params ? {...route, params} : route}>
    {children}
  </NavigationRouteContext.Provider>
)

export const withCommonNavigation = (storyFn) => (
  <CommonNavigationProvider>
    <RouteProvider>{storyFn({navigation, route})}</RouteProvider>
  </CommonNavigationProvider>
)
