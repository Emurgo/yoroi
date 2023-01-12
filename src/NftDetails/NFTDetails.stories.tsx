import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks, RouteProvider} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {NftDetails} from './NftDetails'

storiesOf('NFT Details', module).add('Initial', () => {
  const loadedWallet = {
    ...mocks.wallet,
    fetchNfts: mocks.fetchNfts.success,
    fetchNftModerationStatus: mocks.fetchNftModerationStatus.successGreen,
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
