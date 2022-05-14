import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import BigNumber from 'bignumber.js'
import React from 'react'

import {mockWallet} from '../../../storybook'
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
      availableAmount: new BigNumber('1111111100'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      unsignedTx: null as any,
      easyConfirmDecryptKey: '',
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
