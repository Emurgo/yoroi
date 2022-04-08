import {NavigationRouteContext} from '@react-navigation/core'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CONFIG} from '../../legacy/config'
import {MnemonicShowScreen} from './MnemonicShowScreen'

storiesOf('MnemonicShowScreen', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
    params: {
      mnemonic: CONFIG.DEBUG.MNEMONIC1,
      name: CONFIG.DEBUG.WALLET_NAME,
      password: CONFIG.DEBUG.PASSWORD,
      networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
      walletImplementationId: CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
    },
  }
  return (
    <NavigationRouteContext.Provider value={route}>
      <MnemonicShowScreen />
    </NavigationRouteContext.Provider>
  )
})
