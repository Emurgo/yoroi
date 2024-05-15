import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {QueryProvider, RouteProvider} from '../../.storybook'
import {SelectedWalletProvider} from '../features/WalletManager/context/SelectedWalletContext'
import {mocks, nft} from '../yoroi-wallets/mocks'
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
          <SelectedWalletProvider wallet={loadedWallet}>
            <NftDetailsImage />
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
            <NftDetailsImage />
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
            <NftDetailsImage />
          </SelectedWalletProvider>
        </QueryProvider>
      </RouteProvider>
    )
  })
