import {PortfolioTokenFile} from './token-file'
import {PortfolioTokenInfo} from './token-info'
import {PortfolioTokenPrice} from './token-price'
import {PortfolioTokenSupply} from './token-supply'

export type PortfolioTokenStatus =
  | 'verified'
  | 'unverified'
  | 'scam'
  | 'outdated'

export type PortfolioToken<M extends Record<string, unknown> = {}> = Readonly<{
  info: PortfolioTokenInfo
  files?: ReadonlyArray<PortfolioTokenFile>
  price?: PortfolioTokenPrice
  supply?: PortfolioTokenSupply
  status?: PortfolioTokenStatus
  metadatas?: Readonly<M>
}>

export type PortfolioTokenRecords<T extends PortfolioToken> = {
  [tokenId: PortfolioTokenInfo['id']]: T
}
