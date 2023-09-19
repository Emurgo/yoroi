import {PortfolioTokenInfo} from './token-info'

export type PortfolioQuantity = `${number}`

export type PortfolioAmounts = Readonly<{
  [tokenId: PortfolioTokenInfo['id']]: PortfolioQuantity
}>
export type PortfolioAmount = Readonly<{
  tokenId: PortfolioTokenInfo['id']
  quantity: PortfolioQuantity
}>
