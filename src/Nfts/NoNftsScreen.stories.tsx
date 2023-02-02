import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {NoNftsScreen} from './NoNftsScreen'

storiesOf('NFT/No Nfts Screen', module).add('Default', () => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={mocks.wallet}>
        <NoNftsScreen />
      </SelectedWalletProvider>
    </QueryClientProvider>
  )
})
