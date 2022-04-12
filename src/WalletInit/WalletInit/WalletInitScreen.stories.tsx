import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CONFIG} from '../../legacy/config'
import {WalletInitScreen} from './WalletInitScreen'

storiesOf('WalletInitScreen', module)
  .add('Jormungandr', () => (
    <NavigationRouteContext.Provider
      value={{
        key: 'key',
        name: 'name',
        params: {
          networkId: CONFIG.NETWORKS.JORMUNGANDR.NETWORK_ID,
          walletImplementationId: CONFIG.WALLETS.JORMUNGANDR_ITN.WALLET_IMPLEMENTATION_ID,
        },
      }}
    >
      <WalletInitScreen />
    </NavigationRouteContext.Provider>
  ))
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
