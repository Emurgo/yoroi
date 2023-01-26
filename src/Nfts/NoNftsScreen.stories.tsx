import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import NoNftsScreen from './NoNftsScreen'

storiesOf('NFT/Empty Screen', module).add('Default', () => {
  const loadingWallet = {...mocks.wallet, fetchNfts: mocks.fetchNfts.success.many}
  return (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={loadingWallet}>
        <NoNftsScreen />
      </SelectedWalletProvider>
    </QueryClientProvider>
  )
})
