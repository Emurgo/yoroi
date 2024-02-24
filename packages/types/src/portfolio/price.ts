import {Maybe} from '../helpers/types'
import {PortfolioTokenId} from './token'

export type PortfolioPrice = `${number}` // BigNumber

export type PortfolioTokenPrice = {
  id: PortfolioTokenId
  price: Maybe<PortfolioPrice> // in primary token terms
}
