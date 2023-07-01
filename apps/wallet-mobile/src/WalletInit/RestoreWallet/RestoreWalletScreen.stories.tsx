import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {NETWORK_ID, WALLET_IMPLEMENTATION_ID} from '../../yoroi-wallets/cardano/constants/testnet/constants'
import {RestoreWalletScreen} from './RestoreWalletScreen'

storiesOf('RestoreWalletScreen', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
    params: {
      networkId: NETWORK_ID,
      walletImplementationId: WALLET_IMPLEMENTATION_ID,
    },
  }

  return (
    <NavigationRouteContext.Provider value={route}>
      <RestoreWalletScreen />
    </NavigationRouteContext.Provider>
  )
})
