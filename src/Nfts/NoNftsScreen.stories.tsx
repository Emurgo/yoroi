import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text} from 'react-native'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {NoNftsScreen} from './NoNftsScreen'

storiesOf('NFT/No Nfts Screen', module)
  .add('Default', () => {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <NoNftsScreen message="No NFTs found" />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('With Header', () => {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <NoNftsScreen message="No NFTs found" heading={<Text>Lorem ipsum</Text>} />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
