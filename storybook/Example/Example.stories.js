// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'

import {LayoutGrid, SafeAreaInsets} from '../../storybook'
import Example from './Example'
import {StackNavigation, TabNavigation} from '../navigation'
import {NavigationRouteContext} from '@react-navigation/native'

storiesOf('Example', module)
  .add('Default', () => <Example />)
  .add('with Layout Grid', () => (
    <LayoutGrid>
      <Example />
    </LayoutGrid>
  ))
  .add('with Safe Area Insets', () => (
    <SafeAreaInsets sides={['top', 'left', 'right', 'bottom']}>
      <Example />
    </SafeAreaInsets>
  ))
  .add('with Stack Navigation', () => (
    <StackNavigation>
      <Example />
    </StackNavigation>
  ))
  .add('with Tab Navigation', () => (
    <TabNavigation>
      <Example />
    </TabNavigation>
  ))
  .add('with Route Params', () => (
    <NavigationRouteContext.Provider
      value={{
        key: 'key',
        name: 'name',
        params: {address: 'Good bye'},
      }}
    >
      <Example />
    </NavigationRouteContext.Provider>
  ))
