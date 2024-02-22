import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {AppApiRequestWithCache, PortfolioApiTokenInfosResponse} from '../types'

const primaryETH: Portfolio.Token.Info = {
  decimals: 18,
  ticker: 'ETH',
  name: 'Ethereum',
  symbol: 'Ξ',
  status: Portfolio.Token.Status.Normal,
  application: Portfolio.Token.Application.Token,
  tag: '',
  reference: '0x1234567890abcdef.eth',
  fingerprint: '0x1234567890abcdef',
  website: 'https://ethereum.org',
  originalImage: 'https://cdn.example.com/eth-original.png',
  id: '.',
  nature: Portfolio.Token.Nature.Primary,
  type: Portfolio.Token.Type.FT,
}

const nftCryptoKitty: Portfolio.Token.Info = {
  decimals: 0,
  ticker: 'CryptoKitty',
  name: 'CryptoKitty #1234',
  symbol: 'CK',
  status: Portfolio.Token.Status.Normal,
  application: Portfolio.Token.Application.Token,
  tag: '',
  reference: '0xabcdef1234567890.cryptokitty1234',
  website: 'https://www.cryptokitties.co',
  originalImage: 'https://cdn.example.com/ck-original1234.png',
  id: '14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.43554259',
  fingerprint: 'asset1s7nlt45cc82upqewvjtgu7g97l7eg483c6wu75',
  nature: Portfolio.Token.Nature.Secondary,
  type: Portfolio.Token.Type.NFT,
}

const rnftWhatever: Portfolio.Token.Info = {
  decimals: 0,
  ticker: 'Whatever',
  name: 'Whatever #42',
  symbol: 'WTH',
  status: Portfolio.Token.Status.Normal,
  application: Portfolio.Token.Application.Music,
  tag: '222',
  reference: 'transactionId#1',
  website: 'https://www.whaha.co',
  originalImage: 'https://cdn.whatha.com/ck-original1234.png',
  id: '14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.3031',
  fingerprint: 'asset1s7nlt45cc82upqewvjtgu7g97l7eg483c6wu75',
  nature: Portfolio.Token.Nature.Secondary,
  type: Portfolio.Token.Type.NFT,
}

const apiResponseTokenInfos: PortfolioApiTokenInfosResponse = freeze(
  {
    [primaryETH.id]: [200, primaryETH, 'hash1', 3600],
    [nftCryptoKitty.id]: [200, nftCryptoKitty, 'hash2', 10],
    [rnftWhatever.id]: [304, 0],
  },
  true,
)

const apiRequestTokenInfos: ReadonlyArray<
  AppApiRequestWithCache<Portfolio.Token.Id>
> = [
  [primaryETH.id, 'hash1'],
  [nftCryptoKitty.id, 'hash2'],
  [rnftWhatever.id, 'hash3'],
]

export const tokenInfoMocks = freeze({
  primaryETH,
  nftCryptoKitty,
  rnftWhatever,

  apiResponseResult: apiResponseTokenInfos,
  apiRequestArgs: apiRequestTokenInfos,
})
