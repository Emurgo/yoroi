import {cacheRecordMaker} from '@yoroi/common'
import {Api, App, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {tokenInfoMocks} from './token-info.mocks'

const primaryETH: Portfolio.Token.Discovery = {
  id: '.',
  supply: 45_000_000_000_000n,
  originalMetadata: {
    filteredMintMetadatum: null,
    referenceDatum: null,
    tokenRegistry: null,
  },
  source: {
    decimals: Portfolio.Token.Source.Metadata,
    originalImage: Portfolio.Token.Source.Metadata,
    name: Portfolio.Token.Source.Metadata,
    symbol: Portfolio.Token.Source.Metadata,
    ticker: Portfolio.Token.Source.Metadata,
    description: Portfolio.Token.Source.Metadata,
    website: Portfolio.Token.Source.Metadata,
  },
}

const nftCryptoKitty: Portfolio.Token.Discovery = {
  id: tokenInfoMocks.nftCryptoKitty.id,
  supply: 0n,
  originalMetadata: {
    filteredMintMetadatum: null,
    referenceDatum: null,
    tokenRegistry: null,
  },
  source: {
    decimals: Portfolio.Token.Source.Metadata,
    originalImage: Portfolio.Token.Source.Metadata,
    name: Portfolio.Token.Source.Metadata,
    symbol: Portfolio.Token.Source.Metadata,
    ticker: Portfolio.Token.Source.Metadata,
    description: Portfolio.Token.Source.Metadata,
    website: Portfolio.Token.Source.Metadata,
  },
}

const rnftWhatever: Portfolio.Token.Discovery = {
  id: tokenInfoMocks.rnftWhatever.id,
  supply: 0n,
  originalMetadata: {
    filteredMintMetadatum: null,
    referenceDatum: null,
    tokenRegistry: null,
  },
  source: {
    decimals: Portfolio.Token.Source.Metadata,
    originalImage: Portfolio.Token.Source.Metadata,
    name: Portfolio.Token.Source.Metadata,
    symbol: Portfolio.Token.Source.Metadata,
    ticker: Portfolio.Token.Source.Metadata,
    description: Portfolio.Token.Source.Metadata,
    website: Portfolio.Token.Source.Metadata,
  },
}

const apiResponseTokenDiscoveries: Portfolio.Api.TokenDiscoveriesResponse =
  freeze(
    {
      [nftCryptoKitty.id]: [200, nftCryptoKitty, 'hash2', 10],
      [rnftWhatever.id]: [304, 0],
    },
    true,
  )

const apiRequestTokenDiscoveries: ReadonlyArray<
  Api.RequestWithCache<Portfolio.Token.Id>
> = [
  [nftCryptoKitty.id, 'hash2'],
  [rnftWhatever.id, 'hash3'],
]

const storage: {
  entries1: ReadonlyArray<
    [Portfolio.Token.Id, App.CacheRecord<Portfolio.Token.Discovery>]
  >
} = {
  entries1: [
    [
      primaryETH.id,
      cacheRecordMaker(
        {
          expires: new Date().getTime(),
          hash: 'hash1',
        },
        primaryETH,
      ),
    ],
    [
      nftCryptoKitty.id,
      cacheRecordMaker(
        {
          expires: new Date().getTime(),
          hash: 'hash2',
        },
        nftCryptoKitty,
      ),
    ],
    [
      rnftWhatever.id,
      cacheRecordMaker(
        {
          expires: new Date().getTime(),
          hash: 'hash3',
        },
        rnftWhatever,
      ),
    ],
  ],
}

export const tokenDiscoveryMocks = freeze({
  primaryETH,
  nftCryptoKitty,
  rnftWhatever,

  apiResponseResult: apiResponseTokenDiscoveries,
  apiRequestArgs: apiRequestTokenDiscoveries,

  storage,
})
