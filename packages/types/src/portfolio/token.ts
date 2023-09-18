import {PortfolioTokenFile} from './token-file'
import {PortfolioTokenInfo} from './token-info'
import {PortfolioTokenPrice} from './token-price'
import {PortfolioTokenSupply} from './token-supply'

export type PortfolioTokenStatus =
  | 'verified'
  | 'unverified'
  | 'scam'
  | 'outdated'

export type PortfolioToken<M extends Record<string, unknown> = {}> = {
  info: PortfolioTokenInfo
  files?: Array<PortfolioTokenFile>
  price?: PortfolioTokenPrice
  supply?: PortfolioTokenSupply
  status?: PortfolioTokenStatus
  metadatas?: M
}

export type PortfolioTokenRecords<M extends Record<string, unknown> = {}> = {
  [tokenId: PortfolioTokenInfo['id']]: PortfolioToken<M>
}
