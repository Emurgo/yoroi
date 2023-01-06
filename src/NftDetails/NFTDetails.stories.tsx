import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {NftDetails} from './NftDetails'

storiesOf('NFT Details', module).add('Initial', () => {
  const loadedWallet = {
    ...mocks.wallet,
    fetchNfts: mocks.fetchNfts.success,
    fetchNftModerationStatus: mocks.fetchNftModerationStatus.successGreen,
  }
  return (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={loadedWallet}>
        <NftDetails route={{params: {id: '1'}}} />
      </SelectedWalletProvider>
    </QueryClientProvider>
  )
})
