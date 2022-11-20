import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet, mockYoroiTx} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {SendProvider} from '../Context/SendContext'
import {ConfirmScreen} from './ConfirmScreen'

storiesOf('Send/ConfirmScreen', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
    params: {
      yoroiUnsignedTx: {
        ...mockYoroiTx,
        amounts: {'': '1'},
        fee: {'': '1'},
      },
    },
  }

  return (
    <SelectedWalletProvider wallet={mockWallet}>
      <NavigationRouteContext.Provider value={route}>
        <SendProvider wallet={mockWallet} initialState={{receiver: 'storybook: receiver uri or address'}}>
          <ConfirmScreen />
        </SendProvider>
      </NavigationRouteContext.Provider>
    </SelectedWalletProvider>
  )
})
