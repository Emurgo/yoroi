import {PortfolioTokenAmount} from './amount'
import {PortfolioTokenId} from './token'

export type PortfolioTokenBalances = {
  records: Readonly<Map<PortfolioTokenId, PortfolioTokenAmount>>
  all: ReadonlyArray<PortfolioTokenAmount>
  fts: ReadonlyArray<PortfolioTokenAmount>
  nfts: ReadonlyArray<PortfolioTokenAmount>
}
