import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SendProvider} from '../../../common/SendContext'
import {ReadQRCodeScreen} from './ReadQRCodeScreen'

storiesOf('Send/ReadQRCode', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
  }

  return (
    <NavigationRouteContext.Provider value={route}>
      <SendProvider>
        <ReadQRCodeScreen />
      </SendProvider>
    </NavigationRouteContext.Provider>
  )
})
