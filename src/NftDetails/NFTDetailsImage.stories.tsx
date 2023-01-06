import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {NftDetailsImage} from './NftDetailsImage'

storiesOf('NFT Details Image', module).add('Initial', () => {
  const loadedWallet = {
    ...mocks.wallet,
    fetchNfts: mocks.fetchNfts.success,
    fetchNftModerationStatus: mocks.fetchNftModerationStatus.successGreen,
  }
  return (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={loadedWallet}>
        <NftDetailsImage route={{params: {id: '1'}}} />
      </SelectedWalletProvider>
    </QueryClientProvider>
  )
})
