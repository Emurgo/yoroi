import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks, nft} from '../../yoroi-wallets/mocks'
import {TokenIcon} from './TokenIcon'

storiesOf('TokenIcon', module)
  .add('PrimaryToken', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.one,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
    }
    return <TokenIcon wallet={wallet} tokenId={mocks.wallet.primaryTokenInfo.id} />
  })
  .add('Nft', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.one,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
      fetchTokenInfo: mocks.fetchTokenInfo.success.nft,
    }
    return <TokenIcon wallet={wallet} tokenId={nft.id} />
  })
  .add('Nft - not available in the wallet and fetching info', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.emptyAndLaterPending,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
      fetchTokenInfo: mocks.fetchTokenInfo.success.nft,
    }
    return <TokenIcon wallet={wallet} tokenId={nft.id} />
  })
  .add('Nft - not available in the wallet but found online', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.emptyAndLaterFound,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
      fetchTokenInfo: mocks.fetchTokenInfo.success.nft,
    }
    return <TokenIcon wallet={wallet} tokenId={nft.id} />
  })
  .add('Nft - not available in the wallet not found online', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.emptyAndLaterNotFound,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
      fetchTokenInfo: mocks.fetchTokenInfo.success.nft,
    }
    return <TokenIcon wallet={wallet} tokenId={nft.id} />
  })
  .add('Nft - not available in the wallet error when fetching info', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.emptyAndLaterError,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
      fetchTokenInfo: mocks.fetchTokenInfo.success.nft,
    }
    return <TokenIcon wallet={wallet} tokenId={nft.id} />
  })

  .add('Ft - base64 image', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
      fetchTokenInfo: () =>
        Promise.resolve(mocks.tokenInfos['648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443']),
    }
    return <TokenIcon wallet={wallet} tokenId="648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443" />
  })
  .add('Ft - Image link', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
      fetchTokenInfo: mocks.fetchTokenInfo.success.ft,
    }
    return <TokenIcon wallet={wallet} tokenId="648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443" />
  })
  .add('Ft - No Image', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
      fetchTokenInfo: mocks.fetchTokenInfo.success.ftNoImage,
    }
    return <TokenIcon wallet={wallet} tokenId="648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443" />
  })
