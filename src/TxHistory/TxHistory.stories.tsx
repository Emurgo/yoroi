import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet} from '../../storybook'
import {QueryProvider} from '../../storybook/decorators'
import {SelectedWalletProvider} from '../SelectedWallet'
import {SendProvider} from '../Send/Context/SendContext'
import {TxHistory as TxHistoryScreen} from './TxHistory'

storiesOf('V2/TxHistory', module)
  .add('default', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={mockWallet}>
          <SendProvider wallet={mockWallet}>
            <TxHistoryScreen />
          </SendProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('default with API errors', () => {
    const wallet = {
      ...mockWallet,
      fetchCurrentPrice: () => Promise.reject(new Error('fetchCurrentPrice failed')),
      fetchUTXOs: () => Promise.reject(new Error('fetchUTXOs failed')),
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={wallet}>
          <SendProvider wallet={wallet}>
            <TxHistoryScreen />
          </SendProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('byron', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={{...mockWallet, walletImplementationId: 'haskell-byron'}}>
          <SendProvider wallet={mockWallet}>
            <TxHistoryScreen />
          </SendProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
