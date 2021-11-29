import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CONFIG} from '../../legacy/config/config'
import {WalletInitScreen} from './WalletInitScreen'

storiesOf('WalletInitScreen', module)
  .add('Byron', () => (
    <NavigationRouteContext.Provider
      value={{
        key: 'key',
        name: 'name',
        params: {
          networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
          walletImplementationId: CONFIG.WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID,
        },
      }}
    >
      <WalletInitScreen />
    </NavigationRouteContext.Provider>
  ))
  .add('Shelley', () => (
    <NavigationRouteContext.Provider
      value={{
        key: 'key',
        name: 'name',
        params: {
          networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
          walletImplementationId: CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
        },
      }}
    >
      <WalletInitScreen />
    </NavigationRouteContext.Provider>
  ))
