import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Alert} from 'react-native'

import {AddressReaderQR} from './AddressReaderQR'

storiesOf('AddressReaderQR', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
    params: {onSuccess: (data: string) => Alert.alert(data)},
  }

  return (
    <NavigationRouteContext.Provider value={route}>
      <AddressReaderQR />
    </NavigationRouteContext.Provider>
  )
})
