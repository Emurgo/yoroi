import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {QueryProvider} from '../../.storybook/decorators'
import {SelectedWalletProvider} from '../features/AddWallet/common/Context'
import {SearchProvider} from '../Search/SearchContext'
import {mocks} from '../yoroi-wallets/mocks'
import {Nfts} from './Nfts'

storiesOf('NFT/Gallery', module)
  .add('Default', () => {
    const wallet = {...mocks.wallet, fetchTokenInfo: mocks.fetchTokenInfo.success.randomNft}
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={wallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded & Empty', () => {
    const loadedWallet = {
      ...mocks.wallet,
      utxos: [],
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded & Approved', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchTokenInfo: mocks.fetchTokenInfo.success.randomNft,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded & Requires consent', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchTokenInfo: mocks.fetchTokenInfo.success.randomNft,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.consent,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded & Is blocked', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchTokenInfo: mocks.fetchTokenInfo.success.randomNft,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.blocked,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded & Pending review', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchTokenInfo: mocks.fetchTokenInfo.success.randomNft,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.pendingReview,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded & Mixed moderation type', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchTokenInfo: mocks.fetchTokenInfo.success.randomNft,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.random,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded metadata & NFT Moderation status is loading', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchTokenInfo: mocks.fetchTokenInfo.success.randomNft,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.loading,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loading', () => {
    const errorWallet = {
      ...mocks.wallet,
      fetchTokenInfo: mocks.fetchTokenInfo.loading,
    }
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={errorWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Error loading metadata', () => {
    const errorWallet = {
      ...mocks.wallet,
      fetchTokenInfo: mocks.fetchTokenInfo.error,
    }
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={errorWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
