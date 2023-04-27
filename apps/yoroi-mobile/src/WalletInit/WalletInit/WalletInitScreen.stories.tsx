import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {NETWORK_ID, WALLET_IMPLEMENTATION_ID} from '../../yoroi-wallets/cardano/constants/mainnet/constants'
import {NETWORKS} from '../../yoroi-wallets/cardano/networks'
import {WALLETS} from '../../yoroi-wallets/cardano/utils'
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
