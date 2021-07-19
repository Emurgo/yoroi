// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import WalletInitScreen from './WalletInitScreen'
import {CONFIG} from '../../config/config'

storiesOf('WalletInitScreen', module)
  .add('Byron', ({navigation}) => (
    <WalletInitScreen
      navigation={navigation}
      route={{
        params: {
          networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
          walletImplementationId: CONFIG.WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID,
        },
      }}
    />
  ))
  .add('Shelley', ({navigation}) => (
    <WalletInitScreen
      navigation={navigation}
      route={{
        params: {
          networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
          walletImplementationId: CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
        },
      }}
    />
  ))
