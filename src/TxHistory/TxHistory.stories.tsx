import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mockWallet} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {SendProvider} from '../Send/Context/SendContext'
import {TxHistory as TxHistoryScreen} from './TxHistory'

storiesOf('V2/TxHistory', module)
  .add('default', () => {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={mockWallet}>
          <TxHistoryScreen />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('default with API errors', () => {
    const wallet = {
      ...mockWallet,
      fetchCurrentPrice: () => Promise.reject(new Error('fetchCurrentPrice failed')),
      fetchUTXOs: () => Promise.reject(new Error('fetchUTXOs failed')),
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={wallet}>
          <SendProvider wallet={wallet}>
            <TxHistoryScreen />
          </SendProvider>
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('byron', () => {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={{...mockWallet, walletImplementationId: 'haskell-byron'}}>
          <TxHistoryScreen />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
