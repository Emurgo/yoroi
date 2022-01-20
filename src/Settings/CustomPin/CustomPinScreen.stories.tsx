import {NavigationRouteContext} from '@react-navigation/native'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CustomPinScreen} from './CustomPinScreen'

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
