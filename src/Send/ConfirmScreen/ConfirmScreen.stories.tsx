import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {balance, mockWallet} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import type {Params} from './ConfirmScreen'
import {ConfirmScreen} from './ConfirmScreen'

storiesOf('ConfirmScreen', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
    params: {
      defaultAssetAmount: '1111111111',
      balanceAfterTx: '10',
      address: 'address_123123123',
      availableAmount: '1111111100',
      fee: '1',
      selectedTokens: balance,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yoroiUnsignedTx: null as any,
      easyConfirmDecryptKey: '1234567',
    } as Params,
  }

  return (
    <SelectedWalletProvider wallet={mockWallet}>
      <NavigationRouteContext.Provider value={route}>
        <ConfirmScreen />
      </NavigationRouteContext.Provider>
    </SelectedWalletProvider>
  )
})
