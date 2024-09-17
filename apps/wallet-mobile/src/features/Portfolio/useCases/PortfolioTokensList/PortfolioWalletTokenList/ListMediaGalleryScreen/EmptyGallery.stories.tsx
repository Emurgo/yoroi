import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text} from 'react-native'

import {QueryProvider} from '../../../../../../../.storybook/decorators'
import {mocks} from '../../../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SearchProvider} from '../../../../../Search/SearchContext'
import {EmptyGallery} from './EmptyGallery'

storiesOf('NFT/No Nfts Screen', module)
  .add('Default', () => {
    return (
      <QueryProvider>
        <WalletManagerProviderMock wallet={mocks.wallet}>
          <SearchProvider>
            <EmptyGallery message="No NFTs found" />
          </SearchProvider>
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })
  .add('With Header', () => {
    return (
      <QueryProvider>
        <WalletManagerProviderMock wallet={mocks.wallet}>
          <SearchProvider>
            <EmptyGallery message="No NFTs found" heading={<Text>Lorem ipsum</Text>} />
          </SearchProvider>
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })
