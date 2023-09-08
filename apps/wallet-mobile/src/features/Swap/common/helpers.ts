import {Swap} from '@yoroi/types'
import {BalanceQuantity} from '@yoroi/types/lib/balance/token'
import BigNumber from 'bignumber.js'

import {useSelectedWallet} from '../../../SelectedWallet'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {YoroiEntry} from '../../../yoroi-wallets/types'
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

export const createYoroiEntry = (
  createOrder: Swap.CreateOrderData,
  address: string,
  wallet: YoroiWallet,
): YoroiEntry => {
  const amountEntry = {}

  const tokenId = createOrder?.amounts?.sell.tokenId
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
