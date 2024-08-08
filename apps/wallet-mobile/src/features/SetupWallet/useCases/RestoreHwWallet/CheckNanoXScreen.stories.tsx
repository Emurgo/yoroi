import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CheckNanoXScreen} from './CheckNanoXScreen'

storiesOf('CheckNanoXScreen', module)
  .add('ble', () => {
    return (
      <NavigationRouteContext.Provider value={{key: 'key', name: 'name'}}>
        <CheckNanoXScreen />
      </NavigationRouteContext.Provider>
    )
  })
  .add('usb', () => {
    return (
      <NavigationRouteContext.Provider value={{key: 'key', name: 'name'}}>
        <CheckNanoXScreen />
      </NavigationRouteContext.Provider>
    )
  })
