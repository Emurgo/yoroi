// @flow

import React from 'react'
import {NavigationContext} from '@react-navigation/native'
import {action} from '@storybook/addon-actions'

const commonNavigation = {
  navigate: action('navigate'),
  goBack: action('goBack'),
  reset: action('reset'),
  dispatch: action('dispatch'),

  setParams: action('setParams'),
  setOptions: action('setOptions'),

  addListener: (event: string) => {
    action('addListener')(event)

    return () => action('unsubscribe')(event)
  },
  removeListener: action('removeListener'),

  isFocused: action('isFocused'),
  canGoBack: action('canGoBack'),

  dangerouslyGetParent: action('dangerouslyGetParent'),
  dangerouslyGetState: action('dangerouslyGetState'),
}

const stackNavigation = {
  ...commonNavigation,
  replace: action('replace'),
  push: action('push'),
  pop: action('pop'),
  popToTop: action('popToTop'),
}

const tabNavigation = {
  ...commonNavigation,
  jumpTo: action('jumpTo'),
}

export const StackNavigation = ({children}: {children: React$Node}) => (
  <NavigationContext.Provider value={stackNavigation}>{children}</NavigationContext.Provider>
)

export const TabNavigation = ({children}: {children: React$Node}) => (
  <NavigationContext.Provider value={tabNavigation}>{children}</NavigationContext.Provider>
)
