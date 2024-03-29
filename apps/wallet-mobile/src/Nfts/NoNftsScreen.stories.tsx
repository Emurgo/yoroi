import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text} from 'react-native'

import {QueryProvider} from '../../.storybook/decorators'
import {SearchProvider} from '../Search/SearchContext'
import {SelectedWalletProvider} from '../SelectedWallet'
import {mocks} from '../yoroi-wallets/mocks'
import {NoNftsScreen} from './NoNftsScreen'

storiesOf('NFT/No Nfts Screen', module)
  .add('Default', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <SearchProvider>
            <NoNftsScreen message="No NFTs found" />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('With Header', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <SearchProvider>
            <NoNftsScreen message="No NFTs found" heading={<Text>Lorem ipsum</Text>} />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
