import {Portfolio, Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {YoroiEntry} from '../../../yoroi-wallets/types'
import {Quantities} from '../../../yoroi-wallets/utils'

export const getBuyQuantityForLimitOrder = (
  sellQuantityDenominated: Portfolio.Quantity,
  limitPrice: Portfolio.Quantity,
  buyTokenDecimals: number,
): Portfolio.Quantity => {
  if (Quantities.isZero(limitPrice)) {
    return Quantities.zero
  }

  return Quantities.integer(
    Quantities.quotient(sellQuantityDenominated, limitPrice),
    buyTokenDecimals,
  ).toString() as Portfolio.Quantity
}

export const getSellQuantityForLimitOrder = (
  buyQuantityDenominated: Portfolio.Quantity,
  limitPrice: Portfolio.Quantity,
  sellTokenDecimals: number,
): Portfolio.Quantity => {
  if (Quantities.isZero(limitPrice)) {
    return Quantities.zero
  }

  return Quantities.integer(
    BigNumber(buyQuantityDenominated).times(BigNumber(limitPrice)).toString() as Portfolio.Quantity,
    sellTokenDecimals,
  ).toString() as Portfolio.Quantity
}

export const createYoroiEntry = (
  createOrder: Swap.CreateOrderData,
  address: string,
  wallet: YoroiWallet,
): YoroiEntry => {
  const amountEntry = {}

  const tokenId = createOrder.amounts.sell.tokenId
  if (tokenId != null && createOrder.amounts.sell.quantity !== undefined) {
    if (tokenId === wallet.primaryTokenInfo.id) {
      amountEntry[tokenId] = Quantities.sum([
        createOrder.selectedPool.deposit.quantity,
        createOrder.selectedPool.batcherFee.quantity,
        createOrder.amounts.sell.quantity,
      ])
    } else {
      amountEntry[''] = createOrder.selectedPool.deposit.quantity
      amountEntry[tokenId] = createOrder.amounts.sell.quantity
    }
  }
  return {
    address: address,
    amounts: amountEntry,
  }
}
