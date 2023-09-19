import {Balance, Swap} from '@yoroi/types'
import {BalanceQuantity} from '@yoroi/types/lib/balance/token'
import BigNumber from 'bignumber.js'

import {NumberLocale} from '../../../i18n/languages'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {YoroiEntry} from '../../../yoroi-wallets/types'
import {asQuantity, Quantities} from '../../../yoroi-wallets/utils'

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

export const calculateMinReceived = (
  outputAmount: Balance.Quantity,
  slippagePercentage: number,
  decimals: number,
  numberLocale: NumberLocale,
): string => {
  const slippageDecimal = slippagePercentage / 100
  const result = Number(outputAmount) / (1 + slippageDecimal)
  const [quantities] = Quantities.parseFromText(
    Quantities.denominated(asQuantity(result), decimals ?? 0),
    decimals,
    numberLocale,
  )
  return quantities.slice(0, -1)
}

export const calculateTotalFeels = (
  batcherFee: Balance.Quantity,
  proiderFee: Balance.Quantity,
  wallet: YoroiWallet,
  numberLocale: NumberLocale,
): string => {
  const primaryTokenInfoDecimals = wallet.primaryTokenInfo.decimals
  const result = Quantities.denominated(Quantities.sum([batcherFee, proiderFee]), primaryTokenInfoDecimals ?? 0)
  const [quantities] = Quantities.parseFromText(result, primaryTokenInfoDecimals ?? 0, numberLocale)
  return quantities
}
