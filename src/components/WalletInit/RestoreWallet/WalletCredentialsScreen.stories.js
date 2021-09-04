// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import WalletCredentialsScreen from './WalletCredentialsScreen'
import {NavigationRouteContext} from '@react-navigation/native'

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
