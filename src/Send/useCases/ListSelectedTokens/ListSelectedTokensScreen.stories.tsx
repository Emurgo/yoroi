import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../SelectedWallet'
import {mocks} from '../../../yoroi-wallets/mocks/wallet'
import {SendProvider} from '../../shared/SendContext'
import {ListSelectedTokensScreen} from './ListSelectedTokensScreen'

storiesOf('Send/ListSelectedTokens', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
    params: {},
  }

  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <NavigationRouteContext.Provider value={route}>
        <SendProvider initialState={{}}>
          <ListSelectedTokensScreen />
        </SendProvider>
      </NavigationRouteContext.Provider>
    </SelectedWalletProvider>
  )
})
