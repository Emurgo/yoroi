import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {TxHistory as TxHistoryScreen} from './TxHistory'

storiesOf('V2/TxHistory', module)
  .add('default', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <TxHistoryScreen />
      </SelectedWalletProvider>
    )
  })
  .add('byron', () => {
    return (
      <SelectedWalletProvider wallet={{...mockWallet, walletImplementationId: 'haskell-byron'}}>
        <TxHistoryScreen />
      </SelectedWalletProvider>
    )
  })
