import {Balance, Swap} from '@yoroi/types'

import {AmountPair} from './types'
import {ceilDivision} from '../../utils/ceilDivision'

/**
 * Calculate the amount to sell based on the desired buy amount in a liquidity pool.
 *
 * @param pool - The liquidity pool.
 * @param buy - The desired buy amount.
 *
 * @returns An object containing the buy amount and the calculated sell amount
 * if the balance in the pool is insuficient it wont throw an error
 */
export const getSellAmountByChangingBuy = (
  pool: Swap.Pool,
  buy: Balance.Amount,
): AmountPair => {
  if (!pool) {
    return {
      buy: {tokenId: '', quantity: '0'},
      sell: {tokenId: '', quantity: '0'},
    }
  }
  const initialPoolA = BigInt(pool.tokenA.quantity)
  const initialPoolB = BigInt(pool.tokenB.quantity)

  const poolConstantProduct = initialPoolA * initialPoolB

  const desiredBuyAmount = BigInt(buy.quantity)

  const poolFeeFactor = BigInt(100 * 1000) - BigInt(Number(pool.fee) * 1000)

  const calculateSellAmount = (
    updatedPoolA: bigint,
    updatedPoolB: bigint,
  ): string => {
    const newPoolA =
      updatedPoolA -
      (updatedPoolA > desiredBuyAmount
        ? desiredBuyAmount
        : updatedPoolA - BigInt(1))
    const newPoolB = ceilDivision(poolConstantProduct + newPoolA, newPoolA)
    return ceilDivision(
      (newPoolB - updatedPoolB) * BigInt(100 * 1000),
      poolFeeFactor,
    ).toString()
  }

  const sellTokenId =
    buy.tokenId === pool.tokenA.tokenId
      ? pool.tokenB.tokenId
      : pool.tokenA.tokenId
  const sellQuantity =
    buy.tokenId === pool.tokenA.tokenId
      ? calculateSellAmount(initialPoolA, initialPoolB)
      : calculateSellAmount(initialPoolB, initialPoolA)

  return {
    buy,
    sell: {
      quantity: sellQuantity as Balance.Quantity,
      tokenId: sellTokenId,
    },
  }
}
