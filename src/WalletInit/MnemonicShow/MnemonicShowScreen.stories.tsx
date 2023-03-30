import {NavigationRouteContext} from '@react-navigation/core'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {debugWalletInfo} from '../../features'
import {NETWORK_ID, WALLET_IMPLEMENTATION_ID} from '../../yoroi-wallets/cardano/constants/testnet/constants'
import {MnemonicShowScreen} from './MnemonicShowScreen'

storiesOf('MnemonicShowScreen', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
    params: {
      mnemonic: debugWalletInfo.MNEMONIC1,
      name: debugWalletInfo.WALLET_NAME,
      password: debugWalletInfo.PASSWORD,
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
