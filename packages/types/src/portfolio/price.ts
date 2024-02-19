import {Nullable} from '../helpers/types'
import {PortfolioTokenId} from './token'

export type PortfolioPrice = `${string}` // BigNumber - bad for serialization

export type PortfolioTokenPrice = {
  id: PortfolioTokenId
  price: Nullable<PortfolioPrice> // in primary token terms
}
