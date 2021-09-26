// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'

import MnemonicCheckScreen from './MnemonicCheckScreen'
import {CONFIG} from '../../../config/config'
import {NavigationRouteContext} from '@react-navigation/native'

storiesOf('MnemonicCheckScreen', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
    params: {
      mnemonic: CONFIG.DEBUG.MNEMONIC1,
      name: CONFIG.DEBUG.WALLET_NAME,
      password: CONFIG.DEBUG.PASSWORD,
      networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
      walletImplementationId: 'haskell-shelley',
    },
  }

  return (
    <NavigationRouteContext.Provider value={route}>
      <MnemonicCheckScreen />
    </NavigationRouteContext.Provider>
  )
})
