import {Portfolio, Swap} from '@yoroi/types'

import {AmountPair} from './types'
import {ceilDivision} from '../../utils/ceilDivision'

/**
 * Calculate the amount to buy based on the desired sell amount in a liquidity pool.
 *
 * @param pool - The liquidity pool.
 * @param sell - The desired sell amount.
 *
 * @returns An object containing the sell amount and the calculated buy amount
 * if the balance in the pool is insuficient it wont throw an error
 */
export const getBuyAmountbyChangingSell = (
  pool: Swap.Pool,
  sell: Portfolio.Amount,
): AmountPair => {
  const initialPoolA = BigInt(pool.tokenA.quantity)
  const initialPoolB = BigInt(pool.tokenB.quantity)
  const initialSellAmount = BigInt(sell.quantity)

  const poolConstantProduct = initialPoolA * initialPoolB

  const fee = ceilDivision(
    BigInt(Number(pool.fee) * 1000) * initialSellAmount,
    BigInt(100 * 1000),
  )

  const calculateReceiveAmount = (
    updatedPoolA: bigint,
    updatedPoolB: bigint,
  ): string => {
    const newPoolA = updatedPoolA + initialSellAmount - fee
    const newPoolB = ceilDivision(poolConstantProduct, newPoolA)
    return (updatedPoolB - newPoolB).toString()
  }

  const receiveTokenId =
    sell.tokenId === pool.tokenA.tokenId
      ? pool.tokenB.tokenId
      : pool.tokenA.tokenId
  const receiveQuantity =
    sell.tokenId === pool.tokenA.tokenId
      ? calculateReceiveAmount(initialPoolA, initialPoolB)
      : calculateReceiveAmount(initialPoolB, initialPoolA)

  return {
    sell,
    buy: {
      quantity: receiveQuantity as Portfolio.Quantity,
      tokenId: receiveTokenId,
    },
  }
}
