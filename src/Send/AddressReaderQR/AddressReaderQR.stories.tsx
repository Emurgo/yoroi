import {NavigationRouteContext} from '@react-navigation/native'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {AddressReaderQR} from './AddressReaderQR'

storiesOf('AddressReaderQR', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
  }

  return (
    <NavigationRouteContext.Provider value={route}>
      <AddressReaderQR setQrAmount={action('setQrAmount')} setQrReceiver={action('setQrReceiver')} />
    </NavigationRouteContext.Provider>
  )
})
