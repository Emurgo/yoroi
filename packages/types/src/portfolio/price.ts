import {Nullable} from '../helpers/types'
import {PortfolioTokenId} from './token'

export type PortfolioPrice = `${number}` // BigNumber

export type PortfolioTokenPrice = {
  id: PortfolioTokenId
  price: Nullable<PortfolioPrice> // in primary token terms
}
