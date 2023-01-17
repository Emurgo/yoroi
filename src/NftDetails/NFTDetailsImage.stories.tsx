import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks, RouteProvider} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {NftDetailsImage} from './NftDetailsImage'

storiesOf('NFT Details Image', module)
  .add('Loading', () => {
    const loadingWallet = {...mocks.wallet, fetchNfts: mocks.fetchNfts.loading}
    return (
      <RouteProvider params={{id: '1'}}>
        <QueryClientProvider client={new QueryClient()}>
          <SelectedWalletProvider wallet={loadingWallet}>
            <NftDetailsImage />
          </SelectedWalletProvider>
        </QueryClientProvider>
      </RouteProvider>
    )
  })
  .add('Loaded', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
    }
    return (
      <RouteProvider params={{id: '1'}}>
        <QueryClientProvider client={new QueryClient()}>
          <SelectedWalletProvider wallet={loadedWallet}>
            <NftDetailsImage />
          </SelectedWalletProvider>
        </QueryClientProvider>
      </RouteProvider>
    )
  })
  .add('Error', () => {
    const errorWallet = {...mocks.wallet, fetchNfts: mocks.fetchNfts.error}
    return (
      <RouteProvider params={{id: '1'}}>
        <QueryClientProvider client={new QueryClient()}>
          <SelectedWalletProvider wallet={errorWallet}>
            <NftDetailsImage />
          </SelectedWalletProvider>
        </QueryClientProvider>
      </RouteProvider>
    )
  })
