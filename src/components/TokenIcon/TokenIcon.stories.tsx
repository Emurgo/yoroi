import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks, nft, tokenInfos} from '../../../storybook'
import {TokenIcon} from './TokenIcon'

storiesOf('TokenIcon', module)
  .add('PrimaryToken', () => {
    const wallet = {
      ...mocks.wallet,
      fetchNfts: () => Promise.resolve([nft]),
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
        Promise.resolve(tokenInfos['648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.7755534443']),
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
