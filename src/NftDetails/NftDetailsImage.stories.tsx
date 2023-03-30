import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {QueryProvider, RouteProvider} from '../../.storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {mocks, nft} from '../yoroi-wallets/mocks'
import {NftDetailsImage} from './NftDetailsImage'

storiesOf('NFT/Details Image', module)
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
            <NftDetailsImage />
          </SelectedWalletProvider>
        </QueryProvider>
      </RouteProvider>
    )
  })
  .add('NFT not found in the wallet and loading details', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.emptyAndLaterPending,
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
  .add('NFT not found in the wallet and loaded successfully', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.emptyAndLaterFound,
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
  .add('NFT not found in the wallet and metadata not found', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.emptyAndLaterNotFound,
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
  .add('NFT not found in the wallet and error loading metadata', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.emptyAndLaterError,
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
