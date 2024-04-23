import {
  PortfolioTokenId,
  PortfolioTokenPropertyType,
  PortfolioTokenSource,
} from './token'

export type PortfolioTokenDiscovery = {
  id: PortfolioTokenId

  source: {
    name: PortfolioTokenSource
    decimals: PortfolioTokenSource
    ticker: PortfolioTokenSource
    symbol: PortfolioTokenSource
    image: PortfolioTokenSource
  }

  originalMetadata: {
    filteredMintMetadatum: null | Record<string, unknown>
    referenceDatum: null | Record<string, unknown>
    tokenRegistry: null | Record<string, unknown>
  }

  counters: {
    supply: bigint
    items: number
    totalItems: number
  }

  properties:
    | {
        [property: string]: {
          rarity: number
          detectedType: PortfolioTokenPropertyType
          value: any
        }
      }
    | {}
}
