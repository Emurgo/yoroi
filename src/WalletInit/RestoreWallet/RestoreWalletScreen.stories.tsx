import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CONFIG} from '../../legacy/config'
import {RestoreWalletScreen} from './RestoreWalletScreen'

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
