import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WalletManagerProvider} from '../../context/WalletManagerProvider'
import {mockWalletManager, WalletManager} from '../../wallet-manager'
import {SelectWalletFromList} from './SelectWalletFromListScreen'

storiesOf('SelectWalletFromList', module)
  .add('no wallets', () => (
    <WalletManagerProvider
      walletManager={
        {
          ...mockWalletManager,
        } as WalletManager
      }
    >
      <SelectWalletFromList />
    </WalletManagerProvider>
  ))
  .add('loaded', () => (
    <WalletManagerProvider
      walletManager={
        {
          ...mockWalletManager,
        } as WalletManager
      }
    >
      <SelectWalletFromList />
    </WalletManagerProvider>
  ))
