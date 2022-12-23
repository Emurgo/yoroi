import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {Nfts} from './Nfts'

storiesOf('Nfts', module)
  .add('Loading', () => {
    const loadingWallet = {...mocks.wallet, fetchNfts: mocks.fetchNfts.loading}
    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={loadingWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('Loaded & Approved', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success,
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('Error', () => {
    const errorWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.error,
    }
    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={errorWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
