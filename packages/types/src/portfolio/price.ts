import BigNumber from 'bignumber.js'

import {Maybe} from '../helpers/types'
import {PortfolioTokenId} from './token'

export type PortfolioTokenPrice = {
  id: PortfolioTokenId
  price: Maybe<BigNumber> // in primary token terms
}
