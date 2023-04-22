import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {NETWORKS, WALLETS} from '../../yoroi-wallets'
import {NETWORK_ID, WALLET_IMPLEMENTATION_ID} from '../../yoroi-wallets/cardano/constants/mainnet/constants'
import {WalletInitScreen} from './WalletInitScreen'

storiesOf('WalletInitScreen', module)
  .add('Jormungandr', () => (
    <NavigationRouteContext.Provider
      value={{
        key: 'key',
        name: 'name',
        params: {
          networkId: NETWORKS.JORMUNGANDR.NETWORK_ID,
          walletImplementationId: WALLETS.JORMUNGANDR_ITN.WALLET_IMPLEMENTATION_ID,
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
          networkId: NETWORK_ID,
          walletImplementationId: WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID,
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
          networkId: NETWORK_ID,
          walletImplementationId: WALLET_IMPLEMENTATION_ID,
        },
      }}
    >
      <WalletInitScreen />
    </NavigationRouteContext.Provider>
  ))
