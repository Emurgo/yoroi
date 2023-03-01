import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks, nft} from '../../../storybook'
import {TokenIcon} from './TokenIcon'

storiesOf('TokenIcon', module)
  .add('PrimaryToken', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
    }
    return <TokenIcon wallet={wallet} tokenId={mocks.wallet.primaryTokenInfo.id} />
  })
  .add('Nft', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: () => Promise.resolve([nft]),
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
      fetchTokenInfo: () =>
        Promise.resolve({
          decimals: 0,
          description: undefined,
          fingerprint: nft.fingerprint,
          group: '5449dbad479b09de066bdf7934799c8a5aa2b66cf4a11eb759aa76c6',
          id: nft.id,
          logo: undefined,
          name: nft.name,
          symbol: undefined,
          ticker: undefined,
          url: undefined,
        }),
    }
    return <TokenIcon wallet={wallet} tokenId={nft.id} />
  })
  .add('Ft - base64 image', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
      fetchTokenInfo: () =>
        Promise.resolve({
          decimals: 3,
          description: 'WingRiders testnet wUSDC token.',
          fingerprint: 'asset1n3weea8202dpev06tshdvhe9xd6f9jcqldpc2q',
          group: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198',
          id: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443',
          logo: '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',
          name: 'wUSDC',
          symbol: undefined,
          ticker: 'WUSDC',
          url: 'https://wallet-testnet.nu.fi',
        }),
    }
    return <TokenIcon wallet={wallet} tokenId="648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443" />
  })
  .add('Ft - Image link', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
      fetchTokenInfo: () =>
        Promise.resolve({
          decimals: 3,
          description: 'WingRiders testnet wUSDC token.',
          fingerprint: 'asset1n3weea8202dpev06tshdvhe9xd6f9jcqldpc2q',
          group: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198',
          id: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443',
          logo: 'https://picsum.photos/40',
          name: 'wUSDC',
          symbol: undefined,
          ticker: 'WUSDC',
          url: 'https://wallet-testnet.nu.fi',
        }),
    }
    return <TokenIcon wallet={wallet} tokenId="648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443" />
  })
  .add('Ft - No Image', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: mocks.fetchNfts.success.many,
      fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
      fetchTokenInfo: () =>
        Promise.resolve({
          decimals: 3,
          description: 'WingRiders testnet wUSDC token.',
          fingerprint: 'asset1n3weea8202dpev06tshdvhe9xd6f9jcqldpc2q',
          group: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198',
          id: '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443',
          logo: '',
          name: 'wUSDC',
          symbol: undefined,
          ticker: 'WUSDC',
          url: 'https://wallet-testnet.nu.fi',
        }),
    }
    return <TokenIcon wallet={wallet} tokenId="648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443" />
  })
