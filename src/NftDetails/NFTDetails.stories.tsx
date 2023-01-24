import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks, RouteProvider} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {NftDetails} from './NftDetails'

storiesOf('NFT Details', module)
  .add('Loading', () => {
    const loadingWallet = {...mocks.wallet, fetchNfts: mocks.fetchNfts.loading}
    return (
      <RouteProvider params={{id: '1'}}>
        <QueryClientProvider client={new QueryClient()}>
          <SelectedWalletProvider wallet={loadingWallet}>
            <NftDetails />
          </SelectedWalletProvider>
        </QueryClientProvider>
      </RouteProvider>
    )
  })
  .add('Loaded', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
    }
    return (
      <RouteProvider params={{id: '1'}}>
        <QueryClientProvider client={new QueryClient()}>
          <SelectedWalletProvider wallet={loadedWallet}>
            <NftDetails />
          </SelectedWalletProvider>
        </QueryClientProvider>
      </RouteProvider>
    )
  })
  .add('Error', () => {
    const loadedWallet = {...mocks.wallet, fetchNfts: mocks.fetchNfts.error}
    return (
      <RouteProvider params={{id: '1'}}>
        <QueryClientProvider client={new QueryClient()}>
          <SelectedWalletProvider wallet={loadedWallet}>
            <NftDetails />
          </SelectedWalletProvider>
        </QueryClientProvider>
      </RouteProvider>
    )
  })
