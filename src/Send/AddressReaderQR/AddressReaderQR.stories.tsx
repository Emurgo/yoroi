import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../yoroi-wallets/mocks'
import {SendProvider} from '../Context/SendContext'
import {AddressReaderQR} from './AddressReaderQR'

storiesOf('AddressReaderQR', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
  }

  return (
    <NavigationRouteContext.Provider value={route}>
      <SendProvider wallet={mocks.wallet}>
        <AddressReaderQR />
      </SendProvider>
    </NavigationRouteContext.Provider>
  )
})
