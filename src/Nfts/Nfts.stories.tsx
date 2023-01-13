import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {Nfts} from './Nfts'

storiesOf('NFT Gallery', module)
  .add('Loading', () => {
    const loadingWallet = {...mocks.wallet, fetchNfts: mocks.fetchNfts.loading}
    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={loadingWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('Loaded & Approved', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.successApproved,
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('Loaded & Blurred image', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.successConsent,
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('Loaded & Not approved', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.successBlocked,
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('Loaded & Pending review', () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.successPendingReview,
    }

    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={loadedWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('Error', () => {
    const errorWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.error,
    }
    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={errorWallet}>
          <Nfts />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
