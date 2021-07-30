// @flow

import React, {type Node} from 'react'
import {NavigationContext, NavigationRouteContext} from '@react-navigation/native'
import {action} from '@storybook/addon-actions'

// mockup navigation prop
// some stories may require specific navigation parameters to work; these should
// be specified locally in the story file
const route = {
  key: 'route',
  name: 'route',
  params: {},
}

const navigation = {
  navigate: action('navigate'),
  goBack: action('goBack'),
  reset: action('reset'),
  dispatch: action('dispatch'),

  setParams: action('setParams'),
  setOptions: action('setOptions'),

  addListener: action('addListener'),
  removeListener: action('removeListener'),

  isFocused: action('isFocused'),
  canGoBack: action('canGoBack'),

  dangerouslyGetParent: action('dangerouslyGetParent'),
  dangerouslyGetState: action('dangerouslyGetState'),
}

type NavigationProps = {navigation: typeof navigation, route: typeof route}
type StoryFn = (navigationProps: NavigationProps) => Node

export const withNavigationProps = (storyFn: StoryFn) => (
  <NavigationContext.Provider value={navigation}>
    <NavigationRouteContext.Provider value={route}>{storyFn({navigation, route})}</NavigationRouteContext.Provider>
  </NavigationContext.Provider>
)
