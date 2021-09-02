// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'

import CustomPinScreen from './CustomPinScreen'
import {NavigationRouteContext} from '@react-navigation/native'
import {action} from '@storybook/addon-actions'

storiesOf('CustomPinScreen', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
    params: {
      onSuccess: action('onSuccess'),
    },
  }

  return (
    <NavigationRouteContext.Provider value={route}>
      <CustomPinScreen />
    </NavigationRouteContext.Provider>
  )
})
