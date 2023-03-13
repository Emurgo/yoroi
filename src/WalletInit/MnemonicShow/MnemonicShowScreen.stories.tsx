import {NavigationRouteContext} from '@react-navigation/core'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CONFIG} from '../../legacy/config'
import {NETWORK_ID, WALLET_IMPLEMENTATION_ID} from '../../yoroi-wallets/cardano/shelley-testnet/constants'
import {MnemonicShowScreen} from './MnemonicShowScreen'

storiesOf('MnemonicShowScreen', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
    params: {
      mnemonic: CONFIG.DEBUG.MNEMONIC1,
      name: CONFIG.DEBUG.WALLET_NAME,
      password: CONFIG.DEBUG.PASSWORD,
      networkId: NETWORK_ID,
      walletImplementationId: WALLET_IMPLEMENTATION_ID,
    },
  }
  return (
    <NavigationRouteContext.Provider value={route}>
      <MnemonicShowScreen />
    </NavigationRouteContext.Provider>
  )
})
