import {BalanceQuantity} from '@yoroi/types/lib/balance/token'
import BigNumber from 'bignumber.js'

import {Quantities} from '../../../yoroi-wallets/utils'

export const getBuyQuantityForLimitOrder = (
  sellQuantityDenominated: BalanceQuantity,
  limitPrice: BalanceQuantity,
  buyTokenDecimals: number,
): BalanceQuantity => {
  if (Quantities.isZero(limitPrice)) {
    return Quantities.zero
  }

  return Quantities.integer(
    Quantities.quotient(sellQuantityDenominated, limitPrice),
    buyTokenDecimals,
  ).toString() as BalanceQuantity
}

export const getSellQuantityForLimitOrder = (
  buyQuantityDenominated: BalanceQuantity,
  limitPrice: BalanceQuantity,
  sellTokenDecimals: number,
): BalanceQuantity => {
  if (Quantities.isZero(limitPrice)) {
    return Quantities.zero
  }

  return Quantities.integer(
    BigNumber(buyQuantityDenominated).times(BigNumber(limitPrice)).toString() as BalanceQuantity,
    sellTokenDecimals,
  ).toString() as BalanceQuantity
}
