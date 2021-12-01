import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WalletCredentialsScreen} from './WalletCredentialsScreen'

storiesOf('WalletCredentialsScreen', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
    params: {
      phrase: 'phrase',
      networkId: 300,
      walletImplementationId: 'haskell',
      provider: 'provider',
    },
  }

  return (
    <NavigationRouteContext.Provider value={route}>
      <WalletCredentialsScreen />
    </NavigationRouteContext.Provider>
  )
})
