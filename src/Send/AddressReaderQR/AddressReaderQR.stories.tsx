import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet} from '../../../storybook'
import {SendProvider} from '../Context/SendContext'
import {AddressReaderQR} from './AddressReaderQR'

storiesOf('AddressReaderQR', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
  }

  return (
    <NavigationRouteContext.Provider value={route}>
      <SendProvider wallet={mockWallet}>
        <AddressReaderQR />
      </SendProvider>
    </NavigationRouteContext.Provider>
  )
})
