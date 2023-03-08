import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../SelectedWallet'
import {mocks} from '../../yoroi-wallets/mocks'
import {SendProvider} from '../Context/SendContext'
import {ConfirmScreen} from './ConfirmScreen'

storiesOf('ConfirmScreen', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
    params: {
      yoroiUnsignedTx: {
        ...mocks.yoroiUnsignedTx,
        amounts: {'': '1'},
        fee: {'': '1'},
      },
    },
  }

  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <NavigationRouteContext.Provider value={route}>
        <SendProvider wallet={mocks.wallet} initialState={{receiver: 'storybook: receiver uri or address'}}>
          <ConfirmScreen />
        </SendProvider>
      </NavigationRouteContext.Provider>
    </SelectedWalletProvider>
  )
})
