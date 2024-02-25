import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'
import {
  AppApiRequestWithCache,
  PortfolioApiTokenDiscoveriesResponse,
} from '../types'

const primaryETH: Portfolio.Token.Discovery = {
  id: '.',
  counters: {
    items: 1,
    totalItems: 1,
    supply: 45_000_000_000_000n,
  },
  originalMetadata: {
    filteredMintMetadatum: null,
    referenceDatum: null,
    tokenRegistry: null,
  },
  properties: {},
  source: {
    decimals: Portfolio.Token.Source.Metadata,
    image: Portfolio.Token.Source.Metadata,
    name: Portfolio.Token.Source.Metadata,
    symbol: Portfolio.Token.Source.Metadata,
    ticker: Portfolio.Token.Source.Metadata,
  },
}

const nftCryptoKitty: Portfolio.Token.Discovery = {
  id: '14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.43554259',
  counters: {
    items: 1,
    totalItems: 1,
    supply: 0n,
  },
  originalMetadata: {
    filteredMintMetadatum: null,
    referenceDatum: null,
    tokenRegistry: null,
  },
  properties: {
    eyes: {
      detectedType: Portfolio.Token.PropertyType.String,
      rarity: 0.9,
      value: 'green',
    },
    hair: {
      detectedType: Portfolio.Token.PropertyType.String,
      rarity: 0.001,
      value: 'black',
    },
  },
  source: {
    decimals: Portfolio.Token.Source.Metadata,
    image: Portfolio.Token.Source.Metadata,
    name: Portfolio.Token.Source.Metadata,
    symbol: Portfolio.Token.Source.Metadata,
    ticker: Portfolio.Token.Source.Metadata,
  },
}

const rnftWhatever: Portfolio.Token.Discovery = {
  id: '14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.3031',
  counters: {
    items: 1,
    totalItems: 1,
    supply: 0n,
  },
  originalMetadata: {
    filteredMintMetadatum: null,
    referenceDatum: null,
    tokenRegistry: null,
  },
  properties: {
    head: {
      detectedType: Portfolio.Token.PropertyType.String,
      rarity: 0.9,
      value: 'alien',
    },
    neck: {
      detectedType: Portfolio.Token.PropertyType.String,
      rarity: 0.001,
      value: true,
    },
  },
  source: {
    decimals: Portfolio.Token.Source.Metadata,
    image: Portfolio.Token.Source.Metadata,
    name: Portfolio.Token.Source.Metadata,
    symbol: Portfolio.Token.Source.Metadata,
    ticker: Portfolio.Token.Source.Metadata,
  },
}

const apiResponseTokenDiscoveries: PortfolioApiTokenDiscoveriesResponse =
  freeze(
    {
      [primaryETH.id]: [200, primaryETH, 'hash1', 3600],
      [nftCryptoKitty.id]: [200, nftCryptoKitty, 'hash2', 10],
      [rnftWhatever.id]: [304, 0],
    },
    true,
  )

const apiRequestTokenDiscoveries: ReadonlyArray<
  AppApiRequestWithCache<Portfolio.Token.Id>
> = [
  [primaryETH.id, 'hash1'],
  [nftCryptoKitty.id, 'hash2'],
  [rnftWhatever.id, 'hash3'],
]

export const tokenDiscoveryMocks = freeze({
  primaryETH,
  nftCryptoKitty,
  rnftWhatever,

  apiResponseResult: apiResponseTokenDiscoveries,
  apiRequestArgs: apiRequestTokenDiscoveries,
})
