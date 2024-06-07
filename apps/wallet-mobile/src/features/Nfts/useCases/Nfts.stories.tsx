import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {QueryProvider} from '../../../../.storybook/decorators'
import {mocks} from '../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SearchProvider} from '../../Search/SearchContext'
import {Nfts} from './Nfts'

storiesOf('NFT/Gallery', module)
  .add('Default', () => {
    const wallet = {...mocks.wallet, fetchTokenInfo: mocks.fetchTokenInfo.success.randomNft}
    return (
      <QueryProvider>
        <WalletManagerProviderMock wallet={wallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </WalletManagerProviderMock>
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
        <WalletManagerProviderMock wallet={loadedWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </WalletManagerProviderMock>
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
        <WalletManagerProviderMock wallet={loadedWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </WalletManagerProviderMock>
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
        <WalletManagerProviderMock wallet={loadedWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </WalletManagerProviderMock>
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
        <WalletManagerProviderMock wallet={loadedWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </WalletManagerProviderMock>
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
        <WalletManagerProviderMock wallet={loadedWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </WalletManagerProviderMock>
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
        <WalletManagerProviderMock wallet={loadedWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </WalletManagerProviderMock>
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
        <WalletManagerProviderMock wallet={loadedWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </WalletManagerProviderMock>
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
        <WalletManagerProviderMock wallet={errorWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </WalletManagerProviderMock>
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
        <WalletManagerProviderMock wallet={errorWallet}>
          <SearchProvider>
            <Nfts />
          </SearchProvider>
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })
