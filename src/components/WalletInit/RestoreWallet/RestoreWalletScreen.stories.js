// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import RestoreWalletScreen from './RestoreWalletScreen'
import {CONFIG} from '../../../config/config'
import {NavigationRouteContext} from '@react-navigation/native'

storiesOf('RestoreWalletScreen', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
    params: {
      networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
      walletImplementationId: CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
    },
  }

  return (
    <NavigationRouteContext.Provider value={route}>
      <RestoreWalletScreen />
    </NavigationRouteContext.Provider>
  )
})
