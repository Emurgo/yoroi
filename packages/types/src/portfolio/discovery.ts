import {PortfolioQuantity} from './balance'
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
    filteredMintMetadatum: Record<string, unknown>
    referenceDatum: Record<string, unknown>
    tokenRegistry: Record<string, unknown>
  }

  counters: {
    supply: PortfolioQuantity
    items: number
    totalItems: number
  }

  properties: {
    [property: string]: {
      rarity: number
      detectedType: PortfolioTokenPropertyType
      value: any
    }
  }
}
