// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import RestoreWalletScreen from './RestoreWalletScreen'
import {CONFIG} from '../../../config/config'

storiesOf('RestoreWalletScreen', module).add('Default', ({route, navigation}) => {
  route.params = {
    networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
    walletImplementationId: CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
  }
  return <RestoreWalletScreen route={route} navigation={navigation} />
})
