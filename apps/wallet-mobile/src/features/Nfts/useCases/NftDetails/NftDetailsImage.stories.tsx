import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {QueryProvider, RouteProvider} from '../../../../../.storybook'
import {mocks, nft} from '../../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {NftDetailsImage} from './NftDetailsImage'

storiesOf('NFT/Details Image', module)
  .add('Default', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchTokenInfo: mocks.fetchTokenInfo.success.nft,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
    }
    return (
      <RouteProvider params={{id: nft.id}}>
        <QueryProvider>
          <WalletManagerProviderMock wallet={loadedWallet}>
            <NftDetailsImage />
          </WalletManagerProviderMock>
        </QueryProvider>
      </RouteProvider>
    )
  })
  .add('Loading NFT', () => {
    const wallet = {
      ...mocks.wallet,
      fetchTokenInfo: mocks.fetchTokenInfo.loading,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
    }
    return (
      <RouteProvider params={{id: nft.id}}>
        <QueryProvider>
          <WalletManagerProviderMock wallet={wallet}>
            <NftDetailsImage />
          </WalletManagerProviderMock>
        </QueryProvider>
      </RouteProvider>
    )
  })
  .add('Error loading NFT', () => {
    const wallet = {
      ...mocks.wallet,
      fetchTokenInfo: mocks.fetchTokenInfo.error,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
    }
    return (
      <RouteProvider params={{id: nft.id}}>
        <QueryProvider>
          <WalletManagerProviderMock wallet={wallet}>
            <NftDetailsImage />
          </WalletManagerProviderMock>
        </QueryProvider>
      </RouteProvider>
    )
  })
