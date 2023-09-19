import {PortfolioQuantity} from './amount'

export type PortfolioTokenSupply = Readonly<{
  total: PortfolioQuantity // total circulating supply of the token, without decimals.
  circulating?: PortfolioQuantity // if set the circulating supply of the token, if  undefined the amount in circulation is unknown.
}>
