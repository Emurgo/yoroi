import {PortfolioTokenId, PortfolioTokenSource} from './token'

export type PortfolioTokenDiscovery = {
  id: PortfolioTokenId

  source: {
    name: PortfolioTokenSource
    decimals: PortfolioTokenSource
    ticker: PortfolioTokenSource
    symbol: PortfolioTokenSource
    image: PortfolioTokenSource
    description: PortfolioTokenSource
  }

  originalMetadata: {
    filteredMintMetadatum: null | Record<string, unknown>
    referenceDatum: null | Record<string, unknown>
    tokenRegistry: null | Record<string, unknown>
  }

  supply: bigint
}
