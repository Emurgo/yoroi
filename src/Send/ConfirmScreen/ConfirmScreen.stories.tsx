import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import BigNumber from 'bignumber.js'
import React from 'react'

import {mockWallet, tokenEntries} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import type {Params} from './ConfirmScreen'
import {ConfirmScreen} from './ConfirmScreen'

storiesOf('ConfirmScreen', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
    params: {
      defaultAssetAmount: new BigNumber('1111111111'),
      balanceAfterTx: new BigNumber('10'),
      address: 'address_123123123',
      availableAmount: new BigNumber('1111111100'),
      fee: new BigNumber('1'),
      tokens: tokenEntries,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transactionData: null as any,
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
