import {PortfolioTokenInfo} from './token-info'

export type PortfolioQuantity = `${number}`

export type PortfolioAmounts = {
  [tokenId: PortfolioTokenInfo['id']]: PortfolioQuantity
}
export type PortfolioAmount = {
  tokenId: PortfolioTokenInfo['id']
  quantity: PortfolioQuantity
}
