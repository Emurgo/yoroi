import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {QueryProvider, RouteProvider} from '../../.storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {mocks, nft} from '../yoroi-wallets/mocks'
import {NftDetails} from './NftDetails'

storiesOf('NFT/Details', module)
  .add('Default', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
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
  .add('NFT not found in the wallet and loading details', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.empty,
      fetchNft: mocks.fetchNft.loading,
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
  .add('NFT not found in the wallet and loaded successfully', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.empty,
      fetchNft: mocks.fetchNft.success.found,
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
  .add('NFT not found in the wallet and metadata not found', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.empty,
      fetchNft: mocks.fetchNft.success.notFound,
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
  .add('NFT not found in the wallet and error loading metadata', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.empty,
      fetchNft: mocks.fetchNft.error,
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
