import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {QueryProvider, RouteProvider} from '../../.storybook/decorators'
import {SelectedWalletProvider} from '../SelectedWallet'
import {mocks, nft} from '../yoroi-wallets/mocks'
import {NftDetails} from './NftDetails'

storiesOf('NFT/Details', module)
  .add('Default', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchTokenInfo: mocks.fetchTokenInfo.success.nft,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
    }
    return (
      <RouteProvider params={{id: nft.id}}>
        <QueryProvider>
          <SelectedWalletProvider wallet={loadedWallet}>
            <NftDetails />
          </SelectedWalletProvider>
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
          <SelectedWalletProvider wallet={wallet}>
            <NftDetails />
          </SelectedWalletProvider>
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
          <SelectedWalletProvider wallet={wallet}>
            <NftDetails />
          </SelectedWalletProvider>
        </QueryProvider>
      </RouteProvider>
    )
  })
