import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../src/SelectedWallet'
import {WalletInterface} from '../types'
import {ReceiveScreen} from './ReceiveScreen'

const wallet = {
  walletImplementationId: 'haskell-shelley',
  networkId: 1,
} as WalletInterface

storiesOf('ReceiveScreen', module).add('default', () => (
  <SelectedWalletProvider wallet={wallet}>
    <ReceiveScreen />
  </SelectedWalletProvider>
))
