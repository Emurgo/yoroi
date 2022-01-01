import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../src/SelectedWallet'
import {WalletInterface} from '../types'
import {ReceiveProvider} from './Context'
import {ReceiveScreen} from './ReceiveScreen'

const wallet = {
  walletImplementationId: 'haskell-shelley',
  networkId: 1,
} as WalletInterface

storiesOf('ReceiveScreen', module)
  .add('Default', () => (
    <ReceiveProvider>
      <SelectedWalletProvider wallet={wallet}>
        <ReceiveScreen />
      </SelectedWalletProvider>
    </ReceiveProvider>
  ))
  .add('Info modal opened', () => (
    <ReceiveProvider initialState={{isInfoModalOpen: true}}>
      <SelectedWalletProvider wallet={wallet}>
        <ReceiveScreen />
      </SelectedWalletProvider>
    </ReceiveProvider>
  ))
