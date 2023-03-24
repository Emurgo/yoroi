import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {QueryProvider} from '../../.storybook/decorators'
import {SearchProvider} from '../Search'
import {SelectedWalletProvider} from '../SelectedWallet'
import {generateManyNfts, mocks} from '../yoroi-wallets/mocks'
import {Nfts} from './Nfts'

storiesOf('NFT/Gallery', module)
  .add('Loading metadata', () => {
    const loadingWallet = {...mocks.wallet, fetchNfts: mocks.fetchNfts.loading}
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadingWallet}>
          <SearchProvider>
            <Nfts nfts={[]} search="" />
          </SearchProvider>
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
          <SearchProvider>
            <Nfts nfts={[]} search="" />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded metadata & Approved', async () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <SearchProvider>
            <Nfts nfts={generateManyNfts()} search="" />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded metadata & Blurred image', async () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.consent,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <SearchProvider>
            <Nfts nfts={generateManyNfts()} search="" />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded metadata & Not approved', async () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.blocked,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <SearchProvider>
            <Nfts nfts={generateManyNfts()} search="" />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded metadata & Pending review', async () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.pendingReview,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <SearchProvider>
            <Nfts nfts={generateManyNfts()} search="" />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded metadata & Mixed moderation type', async () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.random,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <SearchProvider>
            <Nfts nfts={generateManyNfts()} search="" />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loaded metadata & NFT Moderation status is loading', async () => {
    const loadedWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.loading,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <SearchProvider>
            <Nfts nfts={generateManyNfts()} search="" />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Error loading metadata', async () => {
    const errorWallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.error,
    }
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={errorWallet}>
          <SearchProvider>
            <Nfts nfts={[]} search="" />
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
