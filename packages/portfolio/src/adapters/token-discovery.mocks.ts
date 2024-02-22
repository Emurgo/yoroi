import {Portfolio} from '@yoroi/types'

const primaryETH: Portfolio.Token.Discovery = {
  id: '.',
  counters: {
    items: 1,
    totalItems: 1,
    supply: '0',
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
} as const

const nftCryptoKitty: Portfolio.Token.Discovery = {
  id: '14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.43554259',
  counters: {
    items: 1,
    totalItems: 1,
    supply: '0',
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
} as const

export const tokenDiscoveryMocks = {
  primaryETH,
  nftCryptoKitty,
}
