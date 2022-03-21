import React from 'react'
import {storiesOf} from '@storybook/react-native'

import {
  LayoutGrid,
  RouteProvider,
  SafeAreaInsets,
  StackNavigationProvider,
  TabNavigationProvider,
} from '../../storybook'
import {Example} from './Example'

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
    <StackNavigationProvider>
      <Example />
    </StackNavigationProvider>
  ))
  .add('with Tab Navigation', () => (
    <TabNavigationProvider>
      <Example />
    </TabNavigationProvider>
  ))
  .add('with Route Params', () => (
    <RouteProvider params={{address: 'Good bye'}}>
      <Example />
    </RouteProvider>
  ))
