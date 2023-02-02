import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks, QueryProvider} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {Nfts} from './Nfts'

storiesOf('NFT/Gallery', module)
  .add('Loading metadata', () => {
    const loadingWallet = {...mocks.wallet, fetchNfts: mocks.fetchNfts.loading}
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadingWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded metadata & Empty', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.empty,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded metadata & Approved', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded metadata & Blurred image', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.consent,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded metadata & Not approved', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.blocked,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded metadata & Pending review', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.pendingReview,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded metadata & Mixed moderation type', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.random,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded metadata & NFT Moderation status is loading', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.loading,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Error loading metadata', () => {
    const errorWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.error,
    }
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={errorWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
